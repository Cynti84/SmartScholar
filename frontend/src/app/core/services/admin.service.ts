import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
interface DashboardAnalytics {
  mostAppliedScholarships: { label: string; value: number }[];
  monthlySignups: { label: string; value: number }[];
  categoryDistribution: { label: string; value: number }[];
  providerActivity: { label: string; value: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private API_URL = `${environment.apiUrl}/admin`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

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
  // SUSPEND STUDENT
  // =========================
  suspendStudent(studentId: number): Observable<any> {
    return this.http.patch(
      `${this.API_URL}/students/${studentId}/suspend`,
      {},
      { headers: this.getHeaders() },
    );
  }

  // =========================
  // ACTIVATE STUDENT
  // =========================
  activateStudent(studentId: number): Observable<any> {
    return this.http.patch(
      `${this.API_URL}/students/${studentId}/activate`,
      {},
      { headers: this.getHeaders() },
    );
  }

  // =========================
  // DELETE STUDENT (HARD DELETE)
  // =========================
  deleteStudent(studentId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/students/${studentId}`, {
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
  //get provider scholarship
  getProviderScholarships(providerId: number) {
    return this.http.get(`${this.API_URL}/providers/${providerId}/scholarships`, {
      headers: this.getHeaders(),
    });
  }
  //provider action
  approveProvider(id: number) {
    return this.http.patch(
      `${this.API_URL}/providers/${id}/approve`,
      {},
      { headers: this.getHeaders() },
    );
  }

  rejectProvider(id: number) {
    return this.http.patch(
      `${this.API_URL}/providers/${id}/reject`,
      {},
      { headers: this.getHeaders() },
    );
  }

  suspendProvider(id: number) {
    return this.http.patch(
      `${this.API_URL}/providers/${id}/suspend`,
      {},
      { headers: this.getHeaders() },
    );
  }

  activateProvider(id: number) {
    return this.http.patch(
      `${this.API_URL}/providers/${id}/activate`,
      {},
      { headers: this.getHeaders() },
    );
  }
  deleteProvider(providerId: number | string): Observable<any> {
    return this.http.delete(`${this.API_URL}/providers/${providerId}`);
  }

  // =========================
  // SCHOLARSHIPS
  // =========================
  approveScholarship(id: number): Observable<any> {
    return this.http.patch(
      `${this.API_URL}/scholarships/${id}/approve`,
      {},
      { headers: this.getHeaders() },
    );
  }

  rejectScholarship(id: number): Observable<any> {
    return this.http.patch(
      `${this.API_URL}/scholarships/${id}/reject`,
      {},
      { headers: this.getHeaders() },
    );
  }

  deleteScholarship(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/scholarships/${id}`, { headers: this.getHeaders() });
  }

  updateScholarship(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.API_URL}/scholarships/${id}`, payload, {
      headers: this.getHeaders(),
    });
  }

  //analytics

  getDashboardAnalytics(): Observable<{ success: boolean; data: DashboardAnalytics }> {
    return this.http.get<{ success: boolean; data: DashboardAnalytics }>(
      `${this.API_URL}/dashboard/analytics`,
      { headers: this.getHeaders() },
    );
  }
  //Notifications
  // Get notifications
  getNotifications() {
    return this.http.get<any>(`${this.API_URL}/notifications`, {
      headers: this.getHeaders(),
    });
  }

  // Create notification (optional)
  createNotification(payload: { type: string; message: string; priority: string }) {
    return this.http.post(`${this.API_URL}/notifications`, payload, {
      headers: this.getHeaders(),
    });
  }
  //anayltics
  // admin.service.ts
  getAdminReports() {
    return this.http.get<any>(`${this.API_URL}/dashboard/reports`, { headers: this.getHeaders() });
  }
}
