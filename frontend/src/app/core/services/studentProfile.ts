import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models/api-response.model';
import { map } from 'rxjs/operators';

export interface StudentProfile {
  country: string;
  academic_level: string;
  field_of_study: string;

  interest?: string;
  profile_image_url?: string | null;
  cv_url?: string | null;

  date_of_birth?: Date;
  gender?: 'male' | 'female' | 'other';
  financial_need?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class StudentProfileService {
  private apiUrl = `${environment.apiUrl}/student`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Get authorization headers
   */
  private getHeaders(isFormData = false): HttpHeaders {
    const token = this.authService.getAccessToken();

    if (isFormData) {
      // For FormData, do NOT set Content-Type; browser will set it automatically
      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Create student profile (supports FormData for file uploads)
   */
  createProfile(profile: StudentProfile | FormData): Observable<ApiResponse> {
    const isFormData = profile instanceof FormData;

    return this.http.post<ApiResponse>(`${this.apiUrl}/profile`, profile, {
      headers: this.getHeaders(isFormData),
    });
  }

  /**
   * Get student profile
   */
  getProfile(): Observable<StudentProfile> {
    return this.http
      .get<ApiResponse>(`${this.apiUrl}/profile`, { headers: this.getHeaders() })
      .pipe(map((res) => res.data));
  }

  /**
   * Update student profile (supports FormData)
   */
  updateProfile(profile: Partial<StudentProfile> | FormData): Observable<ApiResponse> {
    const isFormData = profile instanceof FormData;

    return this.http.put<ApiResponse>(`${this.apiUrl}/update-profile`, profile, {
      headers: this.getHeaders(isFormData),
    });
  }

  /**
   * Delete student profile
   */
  deleteProfile(): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/delete-profile`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Download student profile as a file
   */
  downloadProfile() {
    return this.http.get(`${environment.apiUrl}/profile/download`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }

  // 2FA Methods
  enable2FA(): Observable<ApiResponse<{ secret: string; qrCode: string }>> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/2fa/enable`,
      {},
      { headers: this.getHeaders() }
    );
  }

  verify2FA(token: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/2fa/verify-2fa`,
      { token },
      { headers: this.getHeaders() }
    );
  }

  disable2FA(token: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/2fa/disable-2fa`,
      { token },
      { headers: this.getHeaders() }
    );
  }
}
