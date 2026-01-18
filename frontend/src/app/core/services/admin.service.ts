import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private API_URL = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // 🔐 Always get token from AuthService (single source of truth)
  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  // =========================
  // SCHOLARSHIPS
  // =========================
  getAllScholarships(): Observable<any> {
    return this.http.get(`${this.API_URL}/scholarships`, {
      headers: this.getHeaders(),
    });
  }

  getPendingScholarships(): Observable<any> {
    return this.http.get(`${this.API_URL}/scholarships/pending`, {
      headers: this.getHeaders(),
    });
  }

  // =========================
  // STUDENTS
  // =========================
  getTotalStudents(): Observable<any> {
    return this.http.get(`${this.API_URL}/students/total`, {
      headers: this.getHeaders(),
    });
  }

  getAllStudents(): Observable<any> {
    return this.http.get(`${this.API_URL}/students`, {
      headers: this.getHeaders(),
    });
  }

  // =========================
  // PROVIDERS
  // =========================
  getProviders(): Observable<any> {
    return this.http.get(`${this.API_URL}/providers`, {
      headers: this.getHeaders(),
    });
  }

  getPendingProviders(): Observable<any> {
    return this.http.get(`${this.API_URL}/providers/pending`, {
      headers: this.getHeaders(),
    });
  }

  approveProvider(id: number) {
    return this.http.patch(`${this.API_URL}/providers/${id}/approve`, {});
  }

  rejectProvider(id: number) {
    return this.http.patch(`${this.API_URL}/providers/${id}/reject`, {});
  }

  suspendProvider(id: number) {
    return this.http.patch(`${this.API_URL}/providers/${id}/suspend`, {});
  }

  activateProvider(id: number) {
    return this.http.patch(`${this.API_URL}/providers/${id}/activate`, {});
  }
}
