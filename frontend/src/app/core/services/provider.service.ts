import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface CreateProviderPayload {
  organization_name: string;
  organization_type: string;
  country: string;
  contact_email: string;
  phone: string;
  logo_url: string | null;
  verification_document_url: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private API_URL = `${environment.apiUrl}/provider`;

  constructor(private http: HttpClient) {}

  createProvider(payload: CreateProviderPayload): Observable<any> {
    return this.http.post(`${this.API_URL}/create`, payload);
  }

  getProvider(): Observable<any> {
    return this.http.get(`${this.API_URL}/get`);
  }

  updateProvider(payload: Partial<CreateProviderPayload>): Observable<any> {
    return this.http.put(`${this.API_URL}/update`, payload);
  }

  deleteProvider(): Observable<any> {
    return this.http.delete(`${this.API_URL}/delete`);
  }
}
