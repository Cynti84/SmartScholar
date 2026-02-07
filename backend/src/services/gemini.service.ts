import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY2;
const genAI = new GoogleGenerativeAI(apiKey!);

export interface RecommendationExplanation {
  whyRecommended: string;
  improvementTips: string[];
  matchStrength: "excellent" | "great" | "good" | "fair";
  personalizedNote?: string;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  async generateRecommendationExplanation(
    scholarshipName: string,
    matchedCriteria: string[],
    unmatchedCriteria: string[]
  ): Promise<RecommendationExplanation> {
    const matchPercentage = this.calculateMatchPercentage(
      matchedCriteria,
      unmatchedCriteria
    );
    const matchStrength = this.getMatchStrength(matchPercentage);

    const prompt = `
You are a friendly, encouraging scholarship advisor helping a student understand why a specific scholarship was recommended to them. Your tone should be warm, personal, and motivating—like a mentor who genuinely cares about their success.

Context:
- Scholarship: "${scholarshipName}"
- Match strength: ${matchPercentage}% (${
      matchedCriteria.length
    } matches out of ${
      matchedCriteria.length + unmatchedCriteria.length
    } criteria)

CRITICAL RULES:
✓ Use ONLY the criteria provided below
✓ Be warm, friendly, and encouraging
✓ Make it feel personal (use "you", "your")
✓ Be specific about what matched
✓ Do NOT make guarantees about acceptance
✓ Do NOT invent criteria not listed
✓ Keep each point conversational and natural

---

TASK 1 — Why This Scholarship is Perfect for You:
Based ONLY on these matched criteria, write a warm, encouraging paragraph (3-5 sentences) explaining why this scholarship aligns with the student's profile. Make it feel personal and exciting!

Matched criteria:
${matchedCriteria.map((c) => `- ${c}`).join("\n")}

Write in second person ("you", "your") and sound genuinely excited about the match. Connect the dots between different matching criteria to tell a cohesive story.

---

TASK 2 — Ways to Strengthen Your Application:
Based ONLY on these unmatched criteria, provide 2-4 actionable, future-oriented tips. Frame them as opportunities for growth, not deficiencies.

Unmatched criteria:
${
  unmatchedCriteria.length > 0
    ? unmatchedCriteria.map((c) => `- ${c}`).join("\n")
    : "None - perfect match!"
}

Each tip should:
- Start with an action verb (e.g., "Consider...", "Explore...", "Build...")
- Be encouraging and forward-looking
- NOT mention the scholarship name
- Feel like advice from a supportive mentor

---

TASK 3 — Personalized Encouragement:
Write ONE short, motivating sentence (10-15 words) that captures the overall match strength and encourages the student to apply.

---

OUTPUT FORMAT (follow EXACTLY):

WHY_PERFECT:
[Your warm, personal paragraph here - no bullet points, just natural flowing text]

STRENGTH_TIPS:
- [Tip 1]
- [Tip 2]
- [Tip 3]
- [Tip 4]

ENCOURAGEMENT:
[Your one-sentence encouragement here]

---

Remember: Be genuinely encouraging, make it personal, and help the student feel excited about this opportunity!
`;

    const result = await this.model.generateContent(prompt);
    const text = result.response.text();

    // ---------- Parse response ----------
    const whyMatch = text.match(
      /WHY_PERFECT:\s*([\s\S]*?)(?=STRENGTH_TIPS:|$)/
    );
    const tipsMatch = text.match(
      /STRENGTH_TIPS:\s*([\s\S]*?)(?=ENCOURAGEMENT:|$)/
    );
    const encouragementMatch = text.match(/ENCOURAGEMENT:\s*([\s\S]*?)$/);

    const whyRecommended = whyMatch ? whyMatch[1].trim() : "";
    const personalizedNote = encouragementMatch
      ? encouragementMatch[1].trim()
      : undefined;

    const improvementTips = tipsMatch
      ? tipsMatch[1]
          .split("\n")
          .map((l) => l.replace(/^-\s*/, "").trim())
          .filter(Boolean)
      : [];

    return {
      whyRecommended,
      improvementTips: improvementTips.length > 0 ? improvementTips : [],
      matchStrength,
      personalizedNote,
    };
  }

  private calculateMatchPercentage(
    matched: string[],
    unmatched: string[]
  ): number {
    const total = matched.length + unmatched.length;
    if (total === 0) return 0;
    return Math.round((matched.length / total) * 100);
  }

  private getMatchStrength(
    percentage: number
  ): "excellent" | "great" | "good" | "fair" {
    if (percentage >= 90) return "excellent";
    if (percentage >= 75) return "great";
    if (percentage >= 60) return "good";
    return "fair";
  }
}
