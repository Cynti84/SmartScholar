import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RedFlag {
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  detected: string;
}

export interface FraudAnalysis {
  scholarshipId: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  redFlags: RedFlag[];
  aiExplanation: string;
  recommendations: string[];
  verificationSteps: string[];
  analyzedAt: Date;
}

export interface BatchAnalysisResponse {
  results: FraudAnalysis[];
  summary: {
    total: number;
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FraudDetectionService {
  private baseUrl = `${environment.apiUrl}/admin/fraud-detection`;

  // Cache to avoid re-analyzing same scholarship
  private analysisCache = new Map<number, FraudAnalysis>();

  constructor(private http: HttpClient) {}

  /**
   * Analyze single scholarship
   */
  analyzeScholarship(
    scholarshipId: number,
    forceRefresh = false
  ): Observable<ApiResponse<FraudAnalysis>> {
    // Return cached if available and not forcing refresh
    if (!forceRefresh && this.analysisCache.has(scholarshipId)) {
      return new Observable((observer) => {
        observer.next({
          success: true,
          data: this.analysisCache.get(scholarshipId)!,
        });
        observer.complete();
      });
    }

    return new Observable((observer) => {
      this.http
        .get<ApiResponse<FraudAnalysis>>(`${this.baseUrl}/analyze/${scholarshipId}`)
        .subscribe({
          next: (response) => {
            // Cache the result
            if (response.success && response.data) {
              this.analysisCache.set(scholarshipId, response.data);
            }
            observer.next(response);
            observer.complete();
          },
          error: (error) => observer.error(error),
        });
    });
  }

  /**
   * Batch analyze multiple scholarships
   */
  batchAnalyze(scholarshipIds: number[]): Observable<ApiResponse<BatchAnalysisResponse>> {
    return this.http.post<ApiResponse<BatchAnalysisResponse>>(`${this.baseUrl}/batch-analyze`, {
      scholarshipIds,
    });
  }

  /**
   * Get high-risk scholarships
   */
  getHighRiskScholarships(): Observable<ApiResponse<{ count: number; scholarshipIds: number[] }>> {
    return this.http.get<ApiResponse<{ count: number; scholarshipIds: number[] }>>(
      `${this.baseUrl}/high-risk`
    );
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.analysisCache.clear();
  }

  /**
   * Get risk badge color class
   */
  getRiskBadgeClass(riskLevel: 'low' | 'medium' | 'high'): string {
    switch (riskLevel) {
      case 'high':
        return 'risk-badge-high';
      case 'medium':
        return 'risk-badge-medium';
      case 'low':
        return 'risk-badge-low';
      default:
        return 'risk-badge-unknown';
    }
  }

  /**
   * Get risk icon
   */
  getRiskIcon(riskLevel: 'low' | 'medium' | 'high'): string {
    switch (riskLevel) {
      case 'high':
        return '🚨';
      case 'medium':
        return '⚠️';
      case 'low':
        return '✅';
      default:
        return '❓';
    }
  }

  /**
   * Get severity badge class
   */
  getSeverityClass(severity: 'low' | 'medium' | 'high'): string {
    switch (severity) {
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return 'severity-unknown';
    }
  }
}
