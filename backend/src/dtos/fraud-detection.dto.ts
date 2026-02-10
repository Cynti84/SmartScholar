export interface FraudAnalysisResult {
  scholarshipId: number;
  riskLevel: "low" | "medium" | "high";
  riskScore: number; // 0-100 (higher = more risky)
  redFlags: RedFlag[];
  aiExplanation: string;
  recommendations: string[];
  verificationSteps: string[];
  analyzedAt: Date;
}

export interface RedFlag {
  category: string;
  severity: "low" | "medium" | "high";
  description: string;
  detected: string; // What specifically was detected
}

export interface BatchAnalysisRequest {
  scholarshipIds: number[];
}

export interface BatchAnalysisResponse {
  results: FraudAnalysisResult[];
  summary: {
    total: number;
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
  };
}

export interface MarkSafeRequest {
  adminNotes?: string;
}
