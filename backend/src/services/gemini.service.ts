import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY2;
const genAI = new GoogleGenerativeAI(apiKey!);

export interface RecommendationExplanation {
  whyRecommended: string;
  improvementTips: string[];
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
    const prompt = `
You are assisting a scholarship recommendation system.

Strict rules:
- Use ONLY the criteria provided
- Do NOT invent or infer new eligibility conditions
- Do NOT make guarantees
- Do NOT mention exact scores or probabilities
- Be supportive and neutral

Task A — Why recommended:
- Use ONLY matched criteria
- Return 3–5 concise bullet points
- Each bullet must start with "•"

Task B — How to improve chances:
- Use ONLY unmatched criteria
- Convert them into general, future-oriented suggestions
- Do NOT imply guaranteed eligibility
- Return 2–4 short suggestions
- Suggestions should NOT mention the scholarship name

Return the response in the following format EXACTLY:

WHY_RECOMMENDED:
• bullet point
• bullet point

IMPROVEMENT_TIPS:
- suggestion
- suggestion

Scholarship name:
${scholarshipName}

Matched criteria:
${matchedCriteria.map((c) => `- ${c}`).join("\n")}

Unmatched criteria:
${unmatchedCriteria.map((c) => `- ${c}`).join("\n")}
`;

    const result = await this.model.generateContent(prompt);
    const text = result.response.text();

    // ---------- Parse response ----------
    const whyMatch = text.match(
      /WHY_RECOMMENDED:\s*([\s\S]*?)IMPROVEMENT_TIPS:/
    );
    const improveMatch = text.match(/IMPROVEMENT_TIPS:\s*([\s\S]*)$/);

    const whyRecommended = whyMatch ? whyMatch[1].trim() : "";

    const improvementTips = improveMatch
      ? improveMatch[1]
          .split("\n")
          .map((l) => l.replace(/^-\s*/, "").trim())
          .filter(Boolean)
      : [];

    return {
      whyRecommended,
      improvementTips,
    };
  }
}
