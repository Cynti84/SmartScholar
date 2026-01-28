import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

export interface Scholarship {
  scholarship_id: number;
  provider_id?: number;

  // Basic info
  title: string;
  organization_name: string;
  short_summary: string;

  // Details
  description: string;
  eligibility_criteria: string;
  benefits: string;
  created_at: string; // ISO string from backend
  deadline: string;

  // Categorisation
  country: string;
  education_level: string;
  scholarship_type: string;
  fields_of_study: string[];

  // Structured eligibility
  eligibility_gender?: 'male' | 'female' | 'any';
  eligibility_countries?: string[];
  min_age?: number;
  max_age?: number;
  eligible_education_levels?: string[];
  requires_disability?: boolean;
  income_level?: string;

  // Application
  application_link: string;
  application_instructions: string;
  contact_email?: string;
  contact_phone?: string;

  // Files
  flyer_url?: string;
  banner_url?: string;
  verification_docs?: string[];

  // Admin
  admin_notes?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published';

  // Matching
  matchScore?: number;
}

export interface RecommendedScholarship {
  scholarship_id: number;
  title: string;
  organization_name: string;
  country: string;
  deadline: string;
  matchScore: number;
  fieldOfStudy?: string;
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

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

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
    search?: string,
    sort?: string,
  ): Observable<PaginatedResponse<Scholarship>> {
    const VERY_LARGE_LIMIT = 1000;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', VERY_LARGE_LIMIT.toString());

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
  getRecommendedScholarships(): Observable<RecommendedScholarship[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/recommendations`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((res) =>
          res.map((s) => {
            const fields = s.fields_of_study ?? []; // assume array or null
            return {
              scholarship_id: s.scholarship_id,
              title: s.title,
              organization_name: s.organization_name,
              country: s.country,
              deadline: s.deadline,
              matchScore: Number(s.match_score),
              fieldOfStudy: s.fields_of_study ? s.fields_of_study.join(', ') : 'Any',
            };
          }),
        ),
      );
  }

  // Get active scholarships
  getActiveScholarships(): Observable<{ success: boolean; count: number }> {
    return this.http.get<{ success: boolean; count: number }>(`${this.apiUrl}/active-scholarship`, {
      headers: this.getHeaders(),
    });
  }
}
