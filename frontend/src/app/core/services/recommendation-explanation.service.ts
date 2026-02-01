import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RecommendationExplanation {
  scholarship_id: number;
  whyRecommended: string;
  improvementTips: string[];
}

@Injectable({
  providedIn: 'root',
})
export class RecommendationExplanationService {
  private baseUrl = environment.apiUrl;

  // 🧠 Frontend cache (matchId → explanation)
  private explanationCache = new Map<number, RecommendationExplanation>();

  constructor(private http: HttpClient) {}

  getExplanation(matchId: number): Observable<RecommendationExplanation> {
    // ✅ Return cached explanation if available
    if (this.explanationCache.has(matchId)) {
      return of(this.explanationCache.get(matchId)!);
    }

    return this.http
      .get<RecommendationExplanation>(
        `${this.baseUrl}/student/recommendations/${matchId}/explanation`
      )
      .pipe(
        tap((res) => {
          this.explanationCache.set(matchId, res);
        })
      );
  }

  // Optional: clear cache if needed later
  clearCache(): void {
    this.explanationCache.clear();
  }
}
