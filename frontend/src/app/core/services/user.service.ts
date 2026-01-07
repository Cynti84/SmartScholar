import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models/api-response.model';
import { map } from 'rxjs/operators';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: string;
  phoneNumber?: string;

  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };

  education: {
    level?: string;
    institution?: string;
    fieldOfStudy?: string;
    gpa?: number;
    graduationYear?: number;
  };

  avatar?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/student`;

  private mapBackendToFrontend(data: any): UserProfile {
    return {
      firstName: data.first_name ?? '',
      lastName: data.last_name ?? '',
      email: data.email,

      dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
      gender: data.gender,
      phoneNumber: data.phone_number,

      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zip_code,
      },

      education: {
        level: data.academic_level,
        institution: data.institution,
        fieldOfStudy: data.field_of_study,
        gpa: data.gpa,
        graduationYear: data.graduation_year,
      },

      avatar: data.profile_image_url,
    };
  }

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Create/Update Profile
  createProfile(profile: UserProfile): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/profile`, profile, {
      headers: this.getHeaders(),
    });
  }

  getProfile(): Observable<UserProfile> {
    return this.http
      .get<ApiResponse>(`${this.apiUrl}/profile`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => this.mapBackendToFrontend(res.data)));
  }

  updateProfile(profile: Partial<UserProfile>): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/update-profile`, profile, {
      headers: this.getHeaders(),
    });
  }

  deleteProfile(): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/delete-profile`, {
      headers: this.getHeaders(),
    });
  }

  downloadProfile(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/profile/download`, {
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
