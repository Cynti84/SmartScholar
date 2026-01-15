import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models/api-response.model';

export interface UserScholarship {
  _id: string;
  userId: string;
  scholarshipId: number;
  status: 'bookmarked' | 'applied';
  appliedAt?: Date;
  bookmarkedAt?: Date;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserScholarshipService {
  private apiUrl = `${environment.apiUrl}/student/scholarships`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Bookmark scholarship
  bookmarkScholarship(scholarshipId: number): Observable<ApiResponse<UserScholarship>> {
    return this.http.post<ApiResponse<UserScholarship>>(
      `${this.apiUrl}/${scholarshipId}/bookmark`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Remove bookmark
  removeBookmark(scholarshipId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${scholarshipId}/bookmark`, {
      headers: this.getHeaders(),
    });
  }

  // Mark as applied
  markAsApplied(scholarshipId: number, notes?: number): Observable<ApiResponse<UserScholarship>> {
    return this.http.post<ApiResponse<UserScholarship>>(
      `${this.apiUrl}/${scholarshipId}/apply`,
      { notes },
      { headers: this.getHeaders() }
    );
  }

  // Get bookmarked scholarships
  getBookmarkedScholarships(): Observable<{
    success: boolean;
    data: UserScholarship[];
    count: number;
  }> {
    return this.http.get<{ success: boolean; data: UserScholarship[]; count: number }>(
      `${this.apiUrl}/bookmarked`,
      { headers: this.getHeaders() }
    );
  }

  // Get applied scholarships
  getAppliedScholarships(): Observable<{
    success: boolean;
    data: UserScholarship[];
    count: number;
  }> {
    return this.http.get<{ success: boolean; data: UserScholarship[]; count: number }>(
      `${this.apiUrl}/applied`,
      { headers: this.getHeaders() }
    );
  }

  // Get total applied count
  getTotalApplied(): Observable<{ success: boolean; data: { total: number } }> {
    return this.http.get<{ success: boolean; data: { total: number } }>(
      `${this.apiUrl}/applied/total`,
      { headers: this.getHeaders() }
    );
  }

  // Get expired applied scholarships
  getExpiredApplied(): Observable<{ success: boolean; data: UserScholarship[]; count: number }> {
    return this.http.get<{ success: boolean; data: UserScholarship[]; count: number }>(
      `${this.apiUrl}/applied/expired`,
      { headers: this.getHeaders() }
    );
  }
}
