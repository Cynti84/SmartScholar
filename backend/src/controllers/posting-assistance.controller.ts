import { Request, Response } from "express";
import { PostingAssistantService } from "../services/posting-assistant.service";

const assistantService = new PostingAssistantService();

export class PostingAssistantController {
  /**
   * POST /api/provider/posting-assistant/polish-text
   * Polish/improve text with AI
   */
  async polishText(req: Request, res: Response) {
    try {
      const { text, fieldType, context } = req.body;

      if (!text || !fieldType) {
        return res.status(400).json({
          success: false,
          message: "Text and fieldType are required",
        });
      }

      const result = await assistantService.polishText(
        text,
        fieldType,
        context
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Polish text error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to polish text",
      });
    }
  }

  /**
   * POST /api/provider/posting-assistant/analyze-completeness
   * Analyze form completeness
   */
  async analyzeCompleteness(req: Request, res: Response) {
    try {
      const { formData } = req.body;

      if (!formData) {
        return res.status(400).json({
          success: false,
          message: "Form data is required",
        });
      }

      const result = assistantService.analyzeCompleteness(formData);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Completeness analysis error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze completeness",
      });
    }
  }

  /**
   * POST /api/provider/posting-assistant/generate-suggestion
   * Generate field suggestions
   */
  async generateSuggestion(req: Request, res: Response) {
    try {
      const { fieldType, context } = req.body;

      if (!fieldType || !context) {
        return res.status(400).json({
          success: false,
          message: "fieldType and context are required",
        });
      }

      const result = await assistantService.generateSuggestion(
        fieldType,
        context
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Generate suggestion error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate suggestion",
      });
    }
  }
}
