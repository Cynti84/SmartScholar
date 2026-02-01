import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ObservedValueOf } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RecommendationExplanationService {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getExplanation(matchId: number): Observable<{ explanation: string }> {
    return this.http.get<{ explanation: string }>(
      `${this.baseUrl}/student/recommendations/${matchId}/explanation`
    );
  }
}
