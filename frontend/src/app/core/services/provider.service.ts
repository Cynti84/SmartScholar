import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface ProviderScholarshipDto {
  scholarship_id: number;
  title: string;
  status: 'approved' | 'pending' | 'rejected' | 'published';
  created_at: string;
  application_count?: number;
}

export interface ScholarshipAnalyticsDto {
  views: number;
  bookmarks: number;
  applications: number;
}

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private API_URL = `${environment.apiUrl}/provider`;

  constructor(private http: HttpClient) {}

  createProvider(formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/create`, formData);
  }

  getProvider(): Observable<any> {
    return this.http.get(`${this.API_URL}/get`);
  }

  updateProvider(formData: FormData): Observable<any> {
    return this.http.put(`${this.API_URL}/update`, formData);
  }

  deleteProvider(): Observable<any> {
    return this.http.delete(`${this.API_URL}/delete`);
  }

  // ─── Scholarship CRUD ──────────────────────────────────────────────────────

  createScholarship(formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/scholarships/post`, formData);
  }

  getMyScholarships(): Observable<any> {
    return this.http.get(`${this.API_URL}/scholarships`);
  }

  getScholarshipById(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/scholarships/${id}`);
  }

  updateScholarship(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.API_URL}/scholarships/${id}`, formData);
  }

  deleteScholarship(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/scholarships/${id}`);
  }

  getMostPopularScholarship(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/scholarships/popular`);
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  /**
   * Fetches views, bookmarks, and applications for a single scholarship
   * in one request. Used by the manage-scholarships table.
   */
  getScholarshipAnalytics(scholarshipId: number): Observable<ScholarshipAnalyticsDto> {
    return this.http.get<ScholarshipAnalyticsDto>(
      `${this.API_URL}/scholarships/${scholarshipId}/analytics`
    );
  }

  getSingleScholarshipApplicationsCount(scholarshipId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.API_URL}/scholarships/${scholarshipId}/applications/count`
    );
  }

  getSingleScholarshipViewCount(scholarshipId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.API_URL}/scholarships/${scholarshipId}/views/count`
    );
  }

  getSingleScholarshipBookmarkCount(scholarshipId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.API_URL}/scholarships/${scholarshipId}/bookmarks/count`
    );
  }

  getScholarshipApplicationsCount(scholarshipId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.API_URL}/applications/count`);
  }

  getScholarshipDeadlineById(scholarshipId: number): Observable<{ deadline: string }> {
    return this.http.get<{ deadline: string }>(
      `${this.API_URL}/scholarships/${scholarshipId}/deadline`
    );
  }

  getScholarshipDeadline(): Observable<{ title: string | null; deadline: string | null }> {
    return this.http.get<{ title: string | null; deadline: string | null }>(
      `${this.API_URL}/scholarships/deadline/soonest`
    );
  }

  getApplicantsByEducationLevel(scholarshipId?: number): Observable<any[]> {
    const url = scholarshipId
      ? `${this.API_URL}/applicants/education-level?scholarshipId=${scholarshipId}`
      : `${this.API_URL}/applicants/education-level`;
    return this.http.get<any[]>(url);
  }

  getApplicantsByField(scholarshipId?: number): Observable<any[]> {
    const url = scholarshipId
      ? `${this.API_URL}/applicants/field?scholarshipId=${scholarshipId}`
      : `${this.API_URL}/applicants/field`;
    return this.http.get<any[]>(url);
  }

  getApplicantsByCountry(scholarshipId?: number): Observable<any[]> {
    const url = scholarshipId
      ? `${this.API_URL}/applicants/country?scholarshipId=${scholarshipId}`
      : `${this.API_URL}/applicants/country`;
    return this.http.get<any[]>(url);
  }

  getScholarshipOverview(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/scholarships/overview`);
  }
}
