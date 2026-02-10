import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppDataSource } from "../utils/db";
import { Scholarship } from "../models/scholarships";
import { StudentProfile } from "../models/student_profiles";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface DocumentChecklistItem {
  name: string;
  description: string;
  priority: "required" | "recommended" | "optional";
}

export interface InterviewQuestion {
  question: string;
  category: string;
  tips: string;
}

export interface ApplicationTip {
  category: string;
  advice: string;
  priority: "high" | "medium" | "low";
}

export interface EssayReviewResult {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  alignment: string;
  suggestions: string[];
}

export class ApplicationAssistantService {
  private model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  private scholarshipRepo = AppDataSource.getRepository(Scholarship);
  private studentProfileRepo = AppDataSource.getRepository(StudentProfile);

  /**
   * Generate document checklist based on scholarship requirements
   */
  async generateDocumentChecklist(
    scholarshipId: number,
    studentId: number
  ): Promise<DocumentChecklistItem[]> {
    const scholarship = await this.scholarshipRepo.findOne({
      where: { scholarship_id: scholarshipId },
    });

    if (!scholarship) {
      throw new Error("Scholarship not found");
    }

    const studentProfile = await this.studentProfileRepo.findOne({
      where: { student_id: studentId },
    });

    const prompt = `
You are a scholarship application advisor. Generate a comprehensive document checklist for this scholarship application.

SCHOLARSHIP INFORMATION:
Title: ${scholarship.title}
Organization: ${scholarship.organization_name}
Type: ${scholarship.scholarship_type}
Education Level: ${scholarship.education_level}
Field: ${scholarship.fields_of_study?.join(", ") || "Not specified"}
Eligibility Criteria: ${scholarship.eligibility_criteria}
Application Instructions: ${scholarship.application_instructions}

STUDENT CONTEXT:
Academic Level: ${studentProfile?.academic_level || "Not specified"}
Field of Study: ${studentProfile?.field_of_study || "Not specified"}

Based on the scholarship information and typical application requirements, generate a comprehensive checklist of documents the student will likely need.

IMPORTANT RULES:
1. Mark documents as "required", "recommended", or "optional"
2. For each document, provide a brief description of what it should contain
3. Consider the scholarship type and education level when suggesting documents
4. Be practical - only suggest documents that make sense for this scholarship
5. Include both general documents (CV, transcript) and specific ones based on scholarship requirements

Return ONLY a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "name": "Curriculum Vitae (CV)",
    "description": "Updated CV highlighting academic achievements, work experience, and relevant skills",
    "priority": "required"
  },
  {
    "name": "Academic Transcripts",
    "description": "Official transcripts from your current/most recent institution",
    "priority": "required"
  }
]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      // Clean response
      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const checklist = JSON.parse(cleanedText);
      return checklist;
    } catch (error) {
      console.error("Error generating checklist:", error);
      // Return basic fallback checklist
      return [
        {
          name: "CV/Resume",
          description:
            "Updated curriculum vitae with academic and professional background",
          priority: "required",
        },
        {
          name: "Academic Transcripts",
          description: "Official transcripts from your institution",
          priority: "required",
        },
        {
          name: "Personal Statement",
          description:
            "Essay explaining your goals and why you deserve this scholarship",
          priority: "required",
        },
        {
          name: "Recommendation Letters",
          description: "Letters from professors or supervisors",
          priority: "recommended",
        },
      ];
    }
  }

  /**
   * Generate likely interview questions
   */
  async generateInterviewQuestions(
    scholarshipId: number,
    studentId: number
  ): Promise<InterviewQuestion[]> {
    const scholarship = await this.scholarshipRepo.findOne({
      where: { scholarship_id: scholarshipId },
    });

    if (!scholarship) {
      throw new Error("Scholarship not found");
    }

    const studentProfile = await this.studentProfileRepo.findOne({
      where: { student_id: studentId },
    });

    const prompt = `
You are a scholarship interview coach. Generate likely interview questions for this scholarship.

SCHOLARSHIP INFORMATION:
Title: ${scholarship.title}
Organization: ${scholarship.organization_name}
Type: ${scholarship.scholarship_type}
Field: ${scholarship.fields_of_study?.join(", ") || "Not specified"}
Description: ${scholarship.description}
Benefits: ${scholarship.benefits}

STUDENT CONTEXT:
Academic Level: ${studentProfile?.academic_level || "Not specified"}
Field of Study: ${studentProfile?.field_of_study || "Not specified"}
Student's interests: ${studentProfile?.interest || "Not specified"}

Generate 5-7 interview questions that are likely to be asked for this scholarship. Include:
1. General motivation questions
2. Questions specific to the scholarship's focus area
3. Questions about student's background and goals
4. Behavioral/situational questions

For each question, provide practical tips on how to answer effectively.

Return ONLY a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "question": "Why do you believe you deserve this scholarship?",
    "category": "Motivation",
    "tips": "Focus on your unique qualifications, passion for the field, and how the scholarship aligns with your goals. Be specific with examples."
  }
]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const questions = JSON.parse(cleanedText);
      return questions;
    } catch (error) {
      console.error("Error generating questions:", error);
      return [
        {
          question: "Why do you believe you deserve this scholarship?",
          category: "Motivation",
          tips: "Highlight your academic achievements, passion for your field, and how this scholarship aligns with your career goals.",
        },
        {
          question: "What are your academic and career goals?",
          category: "Goals",
          tips: "Be specific about short-term and long-term goals. Show how this scholarship fits into your plans.",
        },
        {
          question: "Describe a challenge you've overcome.",
          category: "Personal Growth",
          tips: "Use the STAR method (Situation, Task, Action, Result). Show resilience and learning.",
        },
      ];
    }
  }

  /**
   * Generate personalized application tips
   */
  async generateApplicationTips(
    scholarshipId: number,
    studentId: number
  ): Promise<ApplicationTip[]> {
    const scholarship = await this.scholarshipRepo.findOne({
      where: { scholarship_id: scholarshipId },
    });

    if (!scholarship) {
      throw new Error("Scholarship not found");
    }

    const studentProfile = await this.studentProfileRepo.findOne({
      where: { student_id: studentId },
    });

    const prompt = `
You are a scholarship application advisor. Provide personalized tips for this application.

SCHOLARSHIP:
Title: ${scholarship.title}
Type: ${scholarship.scholarship_type}
Field: ${scholarship.fields_of_study?.join(", ") || "Not specified"}
Eligibility: ${scholarship.eligibility_criteria}
Requirements: ${scholarship.application_instructions}

STUDENT PROFILE:
Academic Level: ${studentProfile?.academic_level || "Not specified"}
Field of Study: ${studentProfile?.field_of_study || "Not specified"}
GPA Range: ${studentProfile?.gpa_min || "N/A"} - ${
      studentProfile?.gpa_max || "N/A"
    }
Country: ${studentProfile?.country || "Not specified"}

Generate 5-8 practical, actionable tips to help the student succeed in this application. Consider:
1. What to emphasize based on their profile
2. How to align with scholarship requirements
3. Common mistakes to avoid
4. Strategic advice specific to this scholarship

Categorize tips and mark priority (high/medium/low).

Return ONLY valid JSON array (no markdown):
[
  {
    "category": "Emphasize Strengths",
    "advice": "Highlight your GPA prominently as it meets the scholarship's academic standards",
    "priority": "high"
  }
]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const tips = JSON.parse(cleanedText);
      return tips;
    } catch (error) {
      console.error("Error generating tips:", error);
      return [
        {
          category: "Application Strategy",
          advice:
            "Read all requirements carefully and address each point in your application",
          priority: "high",
        },
        {
          category: "Personal Statement",
          advice:
            "Make your statement personal and specific - avoid generic statements",
          priority: "high",
        },
        {
          category: "Deadlines",
          advice:
            "Submit at least 2-3 days before the deadline to avoid technical issues",
          priority: "medium",
        },
      ];
    }
  }

  /**
   * Review student's essay/personal statement
   */
  async reviewEssay(
    scholarshipId: number,
    studentId: number,
    essay: string
  ): Promise<EssayReviewResult> {
    if (!essay || essay.trim().length < 100) {
      throw new Error("Essay must be at least 100 characters long");
    }

    const scholarship = await this.scholarshipRepo.findOne({
      where: { scholarship_id: scholarshipId },
    });

    if (!scholarship) {
      throw new Error("Scholarship not found");
    }

    const studentProfile = await this.studentProfileRepo.findOne({
      where: { student_id: studentId },
    });

    const prompt = `
You are an expert scholarship essay reviewer. Analyze this student's essay for a scholarship application.

SCHOLARSHIP CONTEXT:
Title: ${scholarship.title}
Organization: ${scholarship.organization_name}
Type: ${scholarship.scholarship_type}
Field: ${scholarship.fields_of_study?.join(", ") || "Not specified"}
Requirements: ${scholarship.eligibility_criteria}
Focus: ${scholarship.description}

STUDENT CONTEXT:
Academic Level: ${studentProfile?.academic_level || "Not specified"}
Field of Study: ${studentProfile?.field_of_study || "Not specified"}
GPA: ${studentProfile?.gpa_max || "Not specified"}

ESSAY TO REVIEW:
"""
${essay}
"""

ANALYZE THE ESSAY AND PROVIDE:
1. Overall Score (0-100) - How well does this essay fit the scholarship requirements and demonstrate merit?
2. Strengths (3-5 specific strong points in the essay)
3. Areas for Improvement (3-5 specific, actionable suggestions)
4. Alignment Analysis - How well does the essay address the scholarship's focus and requirements?
5. Specific Suggestions - Concrete examples of improvements or additions

IMPORTANT:
- Be constructive and encouraging
- Provide specific, actionable feedback
- Consider both content and presentation
- Check alignment with scholarship goals

Return ONLY valid JSON in this exact format (no markdown):
{
  "overallScore": 75,
  "strengths": [
    "Clear articulation of career goals",
    "Strong personal narrative that connects to the field"
  ],
  "improvements": [
    "Add more specific examples of academic achievements",
    "Connect your goals more directly to the scholarship's mission"
  ],
  "alignment": "The essay addresses key themes but could strengthen the connection to the scholarship's focus on innovation in engineering",
  "suggestions": [
    "In paragraph 2, add a specific project or research experience",
    "Conclude with a stronger statement about how this scholarship will impact your goals"
  ]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const review = JSON.parse(cleanedText);
      return review;
    } catch (error) {
      console.error("Error reviewing essay:", error);
      throw new Error("Failed to review essay. Please try again.");
    }
  }
}
