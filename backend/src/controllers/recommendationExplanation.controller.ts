import { Request, Response } from "express";
import { AppDataSource } from "../utils/db";
import { MatchResult } from "../models/match_result";
import { GeminiService } from "../services/gemini.service";

const matchRepo = AppDataSource.getRepository(MatchResult);
const geminiService = new GeminiService();

export class RecommendationExplanationController {
  async getExplanation(req: Request, res: Response) {
    try {
      const matchId = Number(req.params.matchId);

      if (isNaN(matchId)) {
        return res.status(400).json({ error: "Invalid match ID" });
      }

      const match = await matchRepo.findOne({
        where: { match_id: matchId },
        relations: ["student", "scholarship"],
      });

      if (!match) {
        return res.status(404).json({ error: "Recommendation not found" });
      }

      // 🔒 Ensure ownership
      if (match.student?.id !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      if (!match.matched_criteria || match.matched_criteria.length === 0) {
        return res.status(400).json({
          error: "No explanation data available for this recommendation",
        });
      }

      const explanation = await geminiService.generateRecommendationExplanation(
        match.scholarship!.title,
        match.matched_criteria,
        match.unmatched_criteria || []
      );

      return res.json({
        scholarship_id: match.scholarship!.scholarship_id,
        whyRecommended: explanation.whyRecommended,
        improvementTips: explanation.improvementTips,
        matchStrength: explanation.matchStrength,
        personalizedNote: explanation.personalizedNote,
        // Additional context for frontend
        matchedCount: match.matched_criteria.length,
        totalCriteria:
          match.matched_criteria.length +
          (match.unmatched_criteria?.length || 0),
      });
    } catch (error: any) {
      console.error("Gemini explanation error:", error);
      return res.status(500).json({
        error: "Failed to generate explanation",
        message: error.message || "An unexpected error occurred",
      });
    }
  }
}
