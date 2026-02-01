import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PublicScholarship {
  scholarship_id: number;
  title: string;
  short_summary: string;
  country: string;
  scholarship_type: string;
  flyer_url?: string;
  banner_url?: string;
}

@Injectable({ providedIn: 'root' })
export class PublicScholarshipService {
  private apiUrl = `${environment.apiUrl}/scholarships`;

  constructor(private http: HttpClient) {}

  // Fetch first 6 scholarships for landing page
  getLandingScholarships(): Observable<{ success: boolean; data: PublicScholarship[] }> {
    return this.http.get<{ success: boolean; data: PublicScholarship[] }>(
      `${this.apiUrl}/landing?limit=4`,
    );
  }
}
