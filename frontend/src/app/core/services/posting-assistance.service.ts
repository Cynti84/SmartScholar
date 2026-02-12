// frontend/src/core/services/posting-assistant.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PolishTextResponse {
  originalText: string;
  polishedText: string;
  improvements: string[];
  changesCount: number;
}

export interface CompletenessAnalysis {
  score: number; // 0-100
  completedFields: string[];
  missingFields: MissingField[];
  suggestions: string[];
  criticalMissing: string[];
}

export interface MissingField {
  fieldName: string;
  displayName: string;
  importance: 'critical' | 'recommended' | 'optional';
  suggestion: string;
}

export interface SuggestionResponse {
  suggestions: string[];
  template: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PostingAssistantService {
  private baseUrl = `${environment.apiUrl}/provider/posting-assistant`;

  constructor(private http: HttpClient) {}

  /**
   * Polish/improve text with AI
   */
  polishText(
    text: string,
    fieldType: 'title' | 'description' | 'eligibility' | 'benefits' | 'instructions' | 'summary',
    context?: any
  ): Observable<ApiResponse<PolishTextResponse>> {
    return this.http.post<ApiResponse<PolishTextResponse>>(`${this.baseUrl}/polish-text`, {
      text,
      fieldType,
      context,
    });
  }

  /**
   * Analyze form completeness
   */
  analyzeCompleteness(formData: any): Observable<ApiResponse<CompletenessAnalysis>> {
    return this.http.post<ApiResponse<CompletenessAnalysis>>(
      `${this.baseUrl}/analyze-completeness`,
      { formData }
    );
  }

  /**
   * Generate content suggestions
   */
  generateSuggestion(
    fieldType: 'eligibility' | 'benefits' | 'instructions',
    context: any
  ): Observable<ApiResponse<SuggestionResponse>> {
    return this.http.post<ApiResponse<SuggestionResponse>>(`${this.baseUrl}/generate-suggestion`, {
      fieldType,
      context,
    });
  }

  /**
   * Get completeness score color class
   */
  getScoreClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  }

  /**
   * Get importance badge class
   */
  getImportanceClass(importance: 'critical' | 'recommended' | 'optional'): string {
    switch (importance) {
      case 'critical':
        return 'importance-critical';
      case 'recommended':
        return 'importance-recommended';
      case 'optional':
        return 'importance-optional';
      default:
        return '';
    }
  }
}
