import { Request, Response } from "express";
import { MatchingService } from "../services/matching.service";

const matchingService = new MatchingService();

export class MatchingController {
  async getRecommendations(req: Request, res: Response) {
    try {
      const studentId = req.user!.id;
      const results = await matchingService.getRecommendations(studentId);

      return res.json(
        results.map((r) => ({
          scholarship_id: r.scholarship?.scholarship_id,
          title: r.scholarship?.title,
          organization_name: r.scholarship?.organization_name,
          country: r.scholarship?.country,
          deadline: r.scholarship?.deadline,
          match_score: r.match_score,
          matchedCriteria: r.matched_criteria,
          unmatchedCriteria: r.unmatched_criteria,
          match_id: r.match_id,
        }))
      );
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
