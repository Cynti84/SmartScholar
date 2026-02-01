import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey!);

export class GeminiService {
  private model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  async generateRecommendationExplanation(
    scholarshipName: string,
    matchedCriteria: string[]
  ): Promise<string> {
    const prompt = `
You are helping a student understand why a scholarship was recommended.

Strict rules:
- Use ONLY the matched criteria provided
- Do NOT invent or infer new eligibility conditions
- Do NOT mention unmatched criteria
- Do NOT include a title or introduction
- Do NOT make guarantees
- Respond with 3–5 concise bullet points
- Each bullet should start with "•"

Scholarship name: ${scholarshipName}

Matched criteria:
${matchedCriteria.map((c) => `- ${c}`).join("\n")}
`;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}
