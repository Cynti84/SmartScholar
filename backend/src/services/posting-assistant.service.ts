// backend/src/services/posting-assistant.service.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  PolishTextResponse,
  CompletenessAnalysisResponse,
  MissingField,
  ScholarshipFormData,
  GenerateSuggestionResponse,
} from "../dtos/posting-assistant.dto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class PostingAssistantService {
  private model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  /**
   * Polish/improve text with AI
   */
  async polishText(
    text: string,
    fieldType: string,
    context?: any
  ): Promise<PolishTextResponse> {
    const prompt = `
You are a professional scholarship editor. Improve this ${fieldType} text to make it more professional, clear, and compelling.

ORIGINAL TEXT:
"""
${text}
"""

CONTEXT:
- Field Type: ${fieldType}
- Scholarship Type: ${context?.scholarshipType || "Not specified"}
- Education Level: ${context?.educationLevel || "Not specified"}

IMPROVEMENT GOALS:
1. Fix grammar and spelling errors
2. Improve clarity and readability
3. Make it more professional and compelling
4. Keep the same meaning and key points
5. Maintain appropriate length (don't make it much longer)

${fieldType === "title" ? "- Keep it concise (under 100 characters)" : ""}
${
  fieldType === "summary"
    ? "- Keep it brief (1-2 sentences, under 200 characters)"
    : ""
}
${fieldType === "description" ? "- Make it comprehensive but organized" : ""}
${fieldType === "eligibility" ? "- Use clear bullet-point style criteria" : ""}
${fieldType === "benefits" ? "- Highlight specific benefits clearly" : ""}
${fieldType === "instructions" ? "- Make steps clear and actionable" : ""}

Return ONLY valid JSON (no markdown):
{
  "polishedText": "The improved version of the text",
  "improvements": [
    "Fixed grammar error in sentence 2",
    "Clarified eligibility requirements",
    "Added professional tone"
  ]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const cleaned = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const aiResponse = JSON.parse(cleaned);

      return {
        originalText: text,
        polishedText: aiResponse.polishedText,
        improvements: aiResponse.improvements || [],
        changesCount: aiResponse.improvements?.length || 0,
      };
    } catch (error) {
      console.error("Polish text error:", error);
      // Fallback: return original with basic improvements
      return {
        originalText: text,
        polishedText: text.trim(),
        improvements: ["Basic formatting applied"],
        changesCount: 0,
      };
    }
  }

  /**
   * Analyze form completeness
   */
  analyzeCompleteness(
    formData: Partial<ScholarshipFormData>
  ): CompletenessAnalysisResponse {
    const allFields = this.getAllFields();
    const completedFields: string[] = [];
    const missingFields: MissingField[] = [];

    // Check each field
    allFields.forEach((field) => {
      const value = (formData as any)[field.name];
      const isCompleted = this.isFieldCompleted(field.name, value);

      if (isCompleted) {
        completedFields.push(field.name);
      } else {
        missingFields.push({
          fieldName: field.name,
          displayName: field.displayName,
          importance: field.importance,
          suggestion: field.suggestion,
        });
      }
    });

    // Calculate score
    const totalFields = allFields.length;
    const completed = completedFields.length;
    const score = Math.round((completed / totalFields) * 100);

    // Generate suggestions
    const suggestions = this.generateSuggestions(missingFields, formData);
    const criticalMissing = missingFields
      .filter((f) => f.importance === "critical")
      .map((f) => f.displayName);

    return {
      score,
      completedFields,
      missingFields,
      suggestions,
      criticalMissing,
    };
  }

  /**
   * Generate field suggestions based on context
   */
  async generateSuggestion(
    fieldType: "eligibility" | "benefits" | "instructions",
    context: any
  ): Promise<GenerateSuggestionResponse> {
    const prompt = `
You are a scholarship posting assistant. Generate helpful ${fieldType} content for this scholarship.

SCHOLARSHIP CONTEXT:
- Type: ${context.scholarshipType}
- Education Level: ${context.educationLevel}
- Fields of Study: ${context.fieldsOfStudy?.join(", ")}
- Country: ${context.country || "Not specified"}

Generate appropriate ${fieldType} content that:
1. Is specific to this type of scholarship
2. Follows best practices
3. Is clear and professional
4. Covers all important points

Return ONLY valid JSON (no markdown):
{
  "suggestions": [
    "First helpful suggestion",
    "Second helpful suggestion",
    "Third helpful suggestion"
  ],
  "template": "A complete template text the provider can use or customize"
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const cleaned = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error("Generate suggestion error:", error);
      return {
        suggestions: [
          `Add specific ${fieldType} details`,
          `Include relevant requirements`,
          `Be clear and concise`,
        ],
        template: this.getFallbackTemplate(fieldType, context),
      };
    }
  }

  /**
   * Get all fields with metadata
   */
  private getAllFields() {
    return [
      // Critical fields
      {
        name: "title",
        displayName: "Scholarship Title",
        importance: "critical" as const,
        suggestion: "Add a clear, descriptive title",
      },
      {
        name: "organization_name",
        displayName: "Organization Name",
        importance: "critical" as const,
        suggestion: "Specify your organization",
      },
      {
        name: "short_summary",
        displayName: "Short Summary",
        importance: "critical" as const,
        suggestion: "Add a brief 1-2 sentence summary",
      },
      {
        name: "description",
        displayName: "Full Description",
        importance: "critical" as const,
        suggestion: "Provide detailed description",
      },
      {
        name: "eligibility_criteria",
        displayName: "Eligibility Criteria",
        importance: "critical" as const,
        suggestion: "Specify who can apply",
      },
      {
        name: "benefits",
        displayName: "Benefits",
        importance: "critical" as const,
        suggestion: "Describe what the scholarship covers",
      },
      {
        name: "deadline",
        displayName: "Application Deadline",
        importance: "critical" as const,
        suggestion: "Set application deadline",
      },
      {
        name: "country",
        displayName: "Country",
        importance: "critical" as const,
        suggestion: "Select scholarship country",
      },
      {
        name: "education_level",
        displayName: "Education Level",
        importance: "critical" as const,
        suggestion: "Specify education level",
      },
      {
        name: "scholarship_type",
        displayName: "Scholarship Type",
        importance: "critical" as const,
        suggestion: "Select scholarship type",
      },
      {
        name: "fields_of_study",
        displayName: "Fields of Study",
        importance: "critical" as const,
        suggestion: "Add at least one field",
      },
      {
        name: "application_link",
        displayName: "Application Link",
        importance: "critical" as const,
        suggestion: "Provide application URL",
      },
      {
        name: "application_instructions",
        displayName: "Application Instructions",
        importance: "critical" as const,
        suggestion: "Add clear application steps",
      },

      // Recommended fields
      {
        name: "contact_email",
        displayName: "Contact Email",
        importance: "recommended" as const,
        suggestion: "Add contact email for inquiries",
      },
      {
        name: "contact_phone",
        displayName: "Contact Phone",
        importance: "recommended" as const,
        suggestion: "Add contact phone number",
      },
      {
        name: "min_gpa",
        displayName: "Minimum GPA",
        importance: "recommended" as const,
        suggestion: "Specify GPA requirement if any",
      },
      {
        name: "eligibility_gender",
        displayName: "Gender Eligibility",
        importance: "recommended" as const,
        suggestion: "Specify gender requirements",
      },
      {
        name: "income_level",
        displayName: "Income Level",
        importance: "recommended" as const,
        suggestion: "Specify income requirements",
      },
      {
        name: "has_flyer",
        displayName: "Flyer/Brochure",
        importance: "recommended" as const,
        suggestion: "Upload scholarship flyer",
      },
      {
        name: "has_banner",
        displayName: "Banner/Logo",
        importance: "recommended" as const,
        suggestion: "Upload banner or logo",
      },
      {
        name: "has_verification_docs",
        displayName: "Verification Documents",
        importance: "recommended" as const,
        suggestion: "Upload verification documents",
      },

      // Optional fields
      {
        name: "min_age",
        displayName: "Minimum Age",
        importance: "optional" as const,
        suggestion: "Add if there's an age requirement",
      },
      {
        name: "max_age",
        displayName: "Maximum Age",
        importance: "optional" as const,
        suggestion: "Add if there's a maximum age",
      },
      {
        name: "eligibility_countries",
        displayName: "Eligible Countries",
        importance: "optional" as const,
        suggestion: "Specify eligible countries",
      },
      {
        name: "requires_disability",
        displayName: "Disability Requirement",
        importance: "optional" as const,
        suggestion: "Specify if for students with disabilities",
      },
      {
        name: "admin_notes",
        displayName: "Admin Notes",
        importance: "optional" as const,
        suggestion: "Add any notes for admin",
      },
    ];
  }

  /**
   * Check if a field is completed
   */
  private isFieldCompleted(fieldName: string, value: any): boolean {
    if (value === null || value === undefined || value === "") {
      return false;
    }

    // Special cases
    if (fieldName === "fields_of_study") {
      return Array.isArray(value) && value.length > 0;
    }

    if (fieldName === "eligibility_countries") {
      return Array.isArray(value) && value.length > 0;
    }

    if (fieldName.startsWith("has_")) {
      return value === true;
    }

    // String fields
    if (typeof value === "string") {
      return value.trim().length > 0;
    }

    return true;
  }

  /**
   * Generate suggestions based on missing fields
   */
  private generateSuggestions(
    missingFields: MissingField[],
    formData: any
  ): string[] {
    const suggestions: string[] = [];

    // Critical missing fields
    const criticalMissing = missingFields.filter(
      (f) => f.importance === "critical"
    );
    if (criticalMissing.length > 0) {
      suggestions.push(
        `Complete ${criticalMissing.length} required field(s) to proceed`
      );
      suggestions.push(
        `Priority: ${criticalMissing.map((f) => f.displayName).join(", ")}`
      );
    }

    // Context-specific suggestions
    if (!formData.contact_email && !formData.contact_phone) {
      suggestions.push("Add contact information so students can reach you");
    }

    if (!formData.has_flyer && !formData.has_banner) {
      suggestions.push(
        "Upload a flyer or banner to make your scholarship more appealing"
      );
    }

    if (formData.description && formData.description.length < 100) {
      suggestions.push(
        "Expand your description to provide more details (currently quite brief)"
      );
    }

    if (!formData.min_gpa) {
      suggestions.push("Consider adding a minimum GPA requirement");
    }

    return suggestions.slice(0, 5); // Max 5 suggestions
  }

  /**
   * Fallback templates when AI fails
   */
  private getFallbackTemplate(fieldType: string, context: any): string {
    switch (fieldType) {
      case "eligibility":
        return `Applicants must meet the following criteria:
- Currently enrolled or accepted to a ${context.educationLevel} program
- Studying in one of the specified fields: ${context.fieldsOfStudy?.join(", ")}
- Meet minimum academic requirements
- Submit all required application materials by the deadline`;

      case "benefits":
        return `This scholarship provides:
- Financial support for ${
          context.scholarshipType === "Fully Funded"
            ? "full tuition and fees"
            : "educational expenses"
        }
- ${
          context.scholarshipType === "Fully Funded"
            ? "Living stipend"
            : "Partial tuition coverage"
        }
- ${
          context.scholarshipType === "Fully Funded"
            ? "Book allowance"
            : "Educational materials support"
        }
- Recognition as a scholarship recipient`;

      case "instructions":
        return `To apply for this scholarship, please follow these steps:
1. Complete the online application form at the provided link
2. Submit all required documents (transcripts, essays, recommendations)
3. Ensure all materials are submitted before the deadline
4. Await notification of application status
5. Contact us if you have any questions during the process`;

      default:
        return "";
    }
  }
}
