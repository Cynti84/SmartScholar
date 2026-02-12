import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentChecklistItem {
  name: string;
  description: string;
  priority: 'required' | 'recommended' | 'optional';
  completed?: boolean; // For frontend tracking
}

export interface InterviewQuestion {
  question: string;
  category: string;
  tips: string;
}

export interface ApplicationTip {
  category: string;
  advice: string;
  priority: 'high' | 'medium' | 'low';
}

export interface EssayReviewResult {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  alignment: string;
  suggestions: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationAssistantService {
  private baseUrl = `${environment.apiUrl}/student/application-assistant`;

  constructor(private http: HttpClient) {}

  /**
   * Generate document checklist for scholarship application
   */
  getDocumentChecklist(scholarshipId: number): Observable<ApiResponse<DocumentChecklistItem[]>> {
    return this.http.get<ApiResponse<DocumentChecklistItem[]>>(
      `${this.baseUrl}/checklist/${scholarshipId}`
    );
  }

  /**
   * Generate likely interview questions
   */
  getInterviewQuestions(scholarshipId: number): Observable<ApiResponse<InterviewQuestion[]>> {
    return this.http.get<ApiResponse<InterviewQuestion[]>>(
      `${this.baseUrl}/interview-questions/${scholarshipId}`
    );
  }

  /**
   * Get personalized application tips
   */
  getApplicationTips(scholarshipId: number): Observable<ApiResponse<ApplicationTip[]>> {
    return this.http.get<ApiResponse<ApplicationTip[]>>(`${this.baseUrl}/tips/${scholarshipId}`);
  }

  /**
   * Review essay/personal statement
   */
  reviewEssay(scholarshipId: number, essay: string): Observable<ApiResponse<EssayReviewResult>> {
    return this.http.post<ApiResponse<EssayReviewResult>>(
      `${this.baseUrl}/review-essay/${scholarshipId}`,
      { essay }
    );
  }
}
