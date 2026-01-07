import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface CreateStudentProfilePayload {
  country: string;
  academic_level: string;
  field_of_study: string;
  interest?: string;
  profile_image_url?: string | null;
  cv_url?: string | null;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private API_URL = `${environment.apiUrl}/student`;

  constructor(private http: HttpClient) {}

  createProfile(payload: CreateStudentProfilePayload): Observable<any> {
    return this.http.post(`${this.API_URL}/profile`, payload);
  }

  updateProfile(payload: Partial<CreateStudentProfilePayload>): Observable<any> {
    return this.http.put(`${this.API_URL}/update-profile`, payload);
  }

  deleteProfile(): Observable<any> {
    return this.http.delete(`${this.API_URL}/delete-profile`);
  }

  downloadProfile(): Observable<Blob> {
    return this.http.get(`${this.API_URL}/profile/download`, {
      responseType: 'blob',
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.API_URL}/get-profile`);
  }
}
