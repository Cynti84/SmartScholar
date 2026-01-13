import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

export interface Scholarship {
  _id: string;
  title: string;
  description: string;
  amount: number;
  deadline: Date;
  eligibility: {
    minGPA?: number;
    educationLevel?: string[];
    fieldOfStudy?: string[];
    countries?: string[];
  };
  provider: string;
  applicationUrl: string;
  isActive: boolean;

  matchScore?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ScholarshipService {
  private apiUrl = `${environment.apiUrl}/student/scholarships`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Get all scholarships with pagination and search
  getScholarships(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sort?: string
  ): Observable<PaginatedResponse<Scholarship>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (sort) params = params.set('sort', sort);

    return this.http.get<PaginatedResponse<Scholarship>>(this.apiUrl, {
      headers: this.getHeaders(),
      params,
    });
  }

  // Get scholarship by ID
  getScholarshipById(id: string): Observable<{ success: boolean; data: Scholarship }> {
    return this.http.get<{ success: boolean; data: Scholarship }>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Get recommended scholarships

  getRecommendedScholarships() {
    return this.http
      .get<{ success: boolean; data: any[] }>(`${this.apiUrl}/recommended`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((res) => ({
          success: res.success,
          data: res.data.map((s) => ({
            ...s,
            matchScore: s.match_score, // ✅ map snake_case → camelCase
          })),
        }))
      );
  }
  // Get active scholarships
  getActiveScholarships(): Observable<{ success: boolean; count: number }> {
    return this.http.get<{ success: boolean; count: number }>(`${this.apiUrl}/active-scholarship`, {
      headers: this.getHeaders(),
    });
  }
}
