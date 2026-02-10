import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppDataSource } from "../utils/db";
import { Scholarship } from "../models/scholarships";
import { ProviderProfile } from "../models/provider_profiles";
import { FraudAnalysisResult, RedFlag } from "../dtos/fraud-detection.dto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY4!);

export class FraudDetectionService {
  private model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });
  private scholarshipRepo = AppDataSource.getRepository(Scholarship);
  private providerRepo = AppDataSource.getRepository(ProviderProfile);

  /**
   * Analyze a single scholarship for fraud indicators
   */
  async analyzeScholarship(
    scholarshipId: number
  ): Promise<FraudAnalysisResult> {
    const scholarship = await this.scholarshipRepo.findOne({
      where: { scholarship_id: scholarshipId },
      relations: ["provider"],
    });

    if (!scholarship) {
      throw new Error("Scholarship not found");
    }

    // Get provider profile
    let providerProfile: ProviderProfile | null = null;
    if (scholarship.provider_id) {
      providerProfile = await this.providerRepo.findOne({
        where: { provider_id: scholarship.provider_id },
      });
    }

    // Perform rule-based checks first (fast)
    const ruleBasedFlags = this.performRuleBasedChecks(
      scholarship,
      providerProfile
    );

    // Then use AI for deep analysis
    const aiAnalysis = await this.performAIAnalysis(
      scholarship,
      providerProfile,
      ruleBasedFlags
    );

    // Calculate final risk score
    const riskScore = this.calculateRiskScore([
      ...ruleBasedFlags,
      ...aiAnalysis.redFlags,
    ]);
    const riskLevel = this.getRiskLevel(riskScore);

    return {
      scholarshipId,
      riskLevel,
      riskScore,
      redFlags: [...ruleBasedFlags, ...aiAnalysis.redFlags],
      aiExplanation: aiAnalysis.explanation,
      recommendations: aiAnalysis.recommendations,
      verificationSteps: this.generateVerificationSteps(scholarship, riskLevel),
      analyzedAt: new Date(),
    };
  }

  /**
   * Rule-based fraud checks (fast, no AI needed)
   */
  private performRuleBasedChecks(
    scholarship: Scholarship,
    provider: ProviderProfile | null
  ): RedFlag[] {
    const flags: RedFlag[] = [];

    // Check 1: Suspicious URLs
    if (scholarship.application_link) {
      const link = scholarship.application_link.toLowerCase();

      // Shortened URLs
      if (
        link.includes("bit.ly") ||
        link.includes("tinyurl") ||
        link.includes("t.co")
      ) {
        flags.push({
          category: "Suspicious Link",
          severity: "high",
          description: "Uses URL shortener which can hide malicious sites",
          detected: scholarship.application_link,
        });
      }

      // Non-HTTPS
      if (!link.startsWith("https://")) {
        flags.push({
          category: "Insecure Link",
          severity: "medium",
          description: "Application link is not secure (not HTTPS)",
          detected: scholarship.application_link,
        });
      }

      // Free hosting domains
      const freeHosts = [
        "wix.com",
        "weebly.com",
        "blogspot.com",
        "wordpress.com",
        "000webhostapp.com",
      ];
      if (freeHosts.some((host) => link.includes(host))) {
        flags.push({
          category: "Free Hosting",
          severity: "medium",
          description: "Uses free hosting service (less professional)",
          detected: link,
        });
      }
    }

    // Check 2: Missing critical information
    if (!scholarship.contact_email && !scholarship.contact_phone) {
      flags.push({
        category: "Missing Contact Info",
        severity: "high",
        description: "No contact email or phone provided",
        detected: "No contact information",
      });
    }

    if (
      !scholarship.eligibility_criteria ||
      scholarship.eligibility_criteria.length < 20
    ) {
      flags.push({
        category: "Vague Eligibility",
        severity: "medium",
        description: "Eligibility criteria is missing or too vague",
        detected: scholarship.eligibility_criteria || "None provided",
      });
    }

    if (
      !scholarship.application_instructions ||
      scholarship.application_instructions.length < 20
    ) {
      flags.push({
        category: "Missing Instructions",
        severity: "medium",
        description: "Application instructions are missing or incomplete",
        detected: scholarship.application_instructions || "None provided",
      });
    }

    // Check 3: Unrealistic promises in title/description/short summary
    const scamKeywords = [
      "100% guarantee",
      "everyone qualifies",
      "no requirements",
      "get rich",
      "easy money",
      "act now",
      "limited time",
      "guaranteed approval",
      "no strings attached",
    ];

    const textToCheck =
      `${scholarship.title} ${scholarship.description} ${scholarship.short_summary}`.toLowerCase();
    scamKeywords.forEach((keyword) => {
      if (textToCheck.includes(keyword)) {
        flags.push({
          category: "Unrealistic Promises",
          severity: "high",
          description: `Contains suspicious phrase: "${keyword}"`,
          detected: keyword,
        });
      }
    });

    const bannedWords = ["crypto", "bitcoin", "forex"];
    bannedWords.forEach((word) => {
      if (textToCheck.includes(word)) {
        flags.push({
          category: "Banned Content",
          severity: "high",
          description: `Contains banned word: "${word}"`,
          detected: word,
        });
      }
    });

    // Check 4: Excessive punctuation/caps
    const title = scholarship.title;
    const exclamationCount = (title.match(/!/g) || []).length;
    const capsWords = (title.match(/[A-Z]{3,}/g) || []).length;

    if (exclamationCount >= 3) {
      flags.push({
        category: "Unprofessional Formatting",
        severity: "low",
        description: "Title contains excessive exclamation marks",
        detected: `${exclamationCount} exclamation marks`,
      });
    }

    if (capsWords >= 2) {
      flags.push({
        category: "Unprofessional Formatting",
        severity: "low",
        description: "Title contains excessive capitalization",
        detected: "Multiple all-caps words",
      });
    }

    // Check 5: Provider verification status
    if (provider && !provider.verified) {
      flags.push({
        category: "Unverified Provider",
        severity: "medium",
        description: "Provider has not been verified",
        detected: `Provider: ${provider.organization_name}`,
      });
    }

    if (!provider) {
      flags.push({
        category: "No Provider Profile",
        severity: "high",
        description: "No provider profile found",
        detected: "Missing provider information",
      });
    }

    // Check 6: Verification documents
    if (
      !scholarship.verification_docs ||
      scholarship.verification_docs.length === 0
    ) {
      flags.push({
        category: "No Verification Docs",
        severity: "high",
        description: "No verification documents uploaded",
        detected: "No documents provided",
      });
    }

    return flags;
  }

  /**
   * AI-powered deep analysis using Gemini
   */
  private async performAIAnalysis(
    scholarship: Scholarship,
    provider: ProviderProfile | null,
    existingFlags: RedFlag[]
  ): Promise<{
    redFlags: RedFlag[];
    explanation: string;
    recommendations: string[];
  }> {
    const prompt = `
You are a fraud detection expert analyzing scholarship postings. Analyze this scholarship for potential fraud indicators.

SCHOLARSHIP DETAILS:
Title: ${scholarship.title}
Organization: ${scholarship.organization_name}
Description: ${scholarship.description}
Eligibility: ${scholarship.eligibility_criteria}
Application Instructions: ${scholarship.application_instructions}
Application Link: ${scholarship.application_link}
Contact Email: ${scholarship.contact_email || "Not provided"}
Contact Phone: ${scholarship.contact_phone || "Not provided"}
Scholarship Type: ${scholarship.scholarship_type}
Benefits: ${scholarship.benefits}
Deadline: ${scholarship.deadline}

PROVIDER INFO:
Organization: ${provider?.organization_name || "Unknown"}
Verified: ${provider?.verified ? "Yes" : "No"}
Country: ${provider?.country || "Unknown"}

EXISTING FLAGS DETECTED:
${existingFlags.map((f) => `- ${f.category}: ${f.description}`).join("\n")}

ANALYZE FOR:
1. Content quality and professionalism
2. Grammar and spelling issues
3. Inconsistencies or contradictions
4. Vague or misleading information
5. Legitimacy of organization claims
6. Red flags in benefits or promises
7. Application process credibility

Return ONLY valid JSON (no markdown):
{
  "additionalRedFlags": [
    {
      "category": "Poor Grammar",
      "severity": "low",
      "description": "Multiple spelling and grammar errors throughout",
      "detected": "Specific examples of errors"
    }
  ],
  "explanation": "Brief overall assessment of legitimacy (2-3 sentences)",
  "recommendations": [
    "Specific action admin should take",
    "Another recommendation"
  ]
}

If no additional flags found, return empty array for additionalRedFlags.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const analysis = JSON.parse(cleaned);

      return {
        redFlags: analysis.additionalRedFlags || [],
        explanation: analysis.explanation,
        recommendations: analysis.recommendations || [],
      };
    } catch (error) {
      console.error("AI analysis error:", error);
      // Fallback to basic analysis
      return {
        redFlags: [],
        explanation:
          "Automated analysis complete. Review flagged items carefully.",
        recommendations: [
          "Verify organization legitimacy",
          "Check application link manually",
          "Contact provider for clarification if needed",
        ],
      };
    }
  }

  /**
   * Calculate overall risk score (0-100)
   */
  private calculateRiskScore(redFlags: RedFlag[]): number {
    let score = 0;

    redFlags.forEach((flag) => {
      switch (flag.severity) {
        case "high":
          score += 25;
          break;
        case "medium":
          score += 15;
          break;
        case "low":
          score += 5;
          break;
      }
    });

    return Math.min(score, 100);
  }

  /**
   * Determine risk level based on score
   */
  private getRiskLevel(score: number): "low" | "medium" | "high" {
    if (score >= 70) return "high";
    if (score >= 40) return "medium";
    return "low";
  }

  /**
   * Generate verification steps for admin
   */
  private generateVerificationSteps(
    scholarship: Scholarship,
    riskLevel: "low" | "medium" | "high"
  ): string[] {
    const steps: string[] = [];

    if (riskLevel === "high") {
      steps.push("⚠️ HIGH PRIORITY: Thoroughly investigate before approval");
    }

    steps.push("Verify organization exists and is legitimate");

    if (scholarship.application_link) {
      steps.push("Manually visit and verify application link");
    }

    if (scholarship.contact_email) {
      steps.push(
        `Contact organization at ${scholarship.contact_email} for verification`
      );
    }

    if (
      !scholarship.verification_docs ||
      scholarship.verification_docs.length === 0
    ) {
      steps.push("Request official verification documents from provider");
    }

    steps.push("Check for similar scholarships or duplicate content online");

    if (riskLevel === "high" || riskLevel === "medium") {
      steps.push("Consider requesting additional information from provider");
    }

    return steps;
  }

  /**
   * Batch analyze multiple scholarships
   */
  async batchAnalyze(scholarshipIds: number[]) {
    const results = await Promise.all(
      scholarshipIds.map((id) => this.analyzeScholarship(id))
    );

    const summary = {
      total: results.length,
      lowRisk: results.filter((r) => r.riskLevel === "low").length,
      mediumRisk: results.filter((r) => r.riskLevel === "medium").length,
      highRisk: results.filter((r) => r.riskLevel === "high").length,
    };

    return { results, summary };
  }

  /**
   * Get all high-risk pending scholarships
   */
  async getHighRiskScholarships(): Promise<number[]> {
    const pendingScholarships = await this.scholarshipRepo.find({
      where: { status: "pending" },
    });

    const analyses = await Promise.all(
      pendingScholarships.map((s) => this.analyzeScholarship(s.scholarship_id))
    );

    return analyses
      .filter((a) => a.riskLevel === "high")
      .map((a) => a.scholarshipId);
  }
}
