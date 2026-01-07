/* src/app/core/services/auth.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { parseJwt, isTokenExpired } from '../utils/token.util';

const ACCESS_KEY = 'ss_access_token';
const REFRESH_KEY = 'ss_refresh_token';
const TEMP_USER_KEY = 'tempUserData';

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private API_URL = `${environment.apiUrl}/auth`;

  private userSubject = new BehaviorSubject<any | null>(this.getUserFromToken());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ===========================
  // AUTH API CALLS
  // ===========================

  signup(data: SignupPayload): Observable<any> {
    return this.http.post(`${this.API_URL}/signup`, data);
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.API_URL}/verify-email`, {
      params: { token },
    });
  }

  /**
   * login - backend may return either:
   *  { accessToken, refreshToken, data: { ... } } OR { data: { accessToken, refreshToken } }
   */
  login(data: LoginPayload): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, data).pipe(
      tap((res: any) => {
        const access = res?.accessToken ?? res?.data?.accessToken;
        const refresh = res?.refreshToken ?? res?.data?.refreshToken;
        if (access && refresh) {
          this.storeTokens(access, refresh);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, {
      token,
      password,
    });
  }

  /**
   * refreshToken - returns Observable (interceptor compatibility)
   * backend response shape may vary; handle both.
   */
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token found'));
    }

    return this.http.post(`${this.API_URL}/refresh-token`, { refreshToken }).pipe(
      tap((res: any) => {
        const access = res?.accessToken ?? res?.data?.accessToken;
        const refresh = res?.refreshToken ?? res?.data?.refreshToken;
        if (access && refresh) {
          this.storeTokens(access, refresh);
        } else {
          this.clearTokens();
        }
      }),
      catchError((err) => {
        this.clearTokens();
        return throwError(() => err);
      })
    );
  }

  /**
   * LOGOUT
   */
  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {}).pipe(
      catchError(() => {
        // ignore backend errors but still clear locally
        return [];
      }),
      tap(() => this.clearTokens())
    );
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.API_URL}/me`);
  }

  // ===========================
  // TOKEN MANAGEMENT
  // ===========================

  /**
   * storeTokens - centralize storing and updating userSubject
   */
  storeTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);

    const user = parseJwt(accessToken);
    this.userSubject.next(user ?? null);
  }

  private clearTokens() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(TEMP_USER_KEY);
    this.userSubject.next(null);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    // if token expired -> not logged in
    return !isTokenExpired(token);
  }

  // public getter for guards and components to read user synchronously
  public getUser(): any | null {
    return this.getUserFromToken();
  }

  private getUserFromToken() {
    const token = this.getAccessToken();
    return token ? parseJwt(token) : null;
  }

  // ===========================
  // TEMP USER STORAGE
  // ===========================

  saveTempUser(data: any) {
    localStorage.setItem(TEMP_USER_KEY, JSON.stringify(data));
  }

  getTempUser(): any {
    const raw = localStorage.getItem(TEMP_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
