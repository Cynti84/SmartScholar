import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ReadinessResult {
  overallReadiness: 'ready' | 'mostly-ready' | 'needs-improvement' | 'not-eligible';
  readinessScore: number;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  weakAreas: string[];
  strengthAreas: string[];
  recommendations: string[];
  aiExplanation: string;
}

export interface ReadinessResponse {
  success: boolean;
  data: {
    scholarship: {
      id: number;
      title: string;
      organization: string;
      deadline: string;
    };
    readiness: ReadinessResult;
  };
}

interface CachedReadiness {
  data: ReadinessResponse;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationReadinessService {
  private apiUrl = `${environment.apiUrl}/student`; // Changed this line
  private cache = new Map<number, CachedReadiness>();
  private cacheExpiration = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(private http: HttpClient) {}

  /**
   * Check application readiness with caching
   */
  checkReadiness(scholarshipId: number, forceRefresh = false): Observable<ReadinessResponse> {
    // Check cache first
    if (!forceRefresh) {
      const cached = this.getCachedReadiness(scholarshipId);
      if (cached) {
        console.log(`Using cached readiness for scholarship ${scholarshipId}`);
        return of(cached);
      }
    }

    // Make API call
    console.log(`Fetching fresh readiness data for scholarship ${scholarshipId}`);
    return this.http
      .post<ReadinessResponse>(`${this.apiUrl}/scholarships/${scholarshipId}/check-readiness`, {})
      .pipe(
        tap((response) => {
          // Cache the response
          this.cacheReadiness(scholarshipId, response);
        }),
        catchError((error) => {
          console.error('Error checking readiness:', error);
          throw error;
        })
      );
  }

  /**
   * Get cached readiness if valid
   */
  private getCachedReadiness(scholarshipId: number): ReadinessResponse | null {
    const cached = this.cache.get(scholarshipId);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - cached.timestamp > this.cacheExpiration;

    if (isExpired) {
      this.cache.delete(scholarshipId);
      return null;
    }

    return cached.data;
  }

  /**
   * Cache readiness result
   */
  private cacheReadiness(scholarshipId: number, data: ReadinessResponse): void {
    this.cache.set(scholarshipId, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache for a specific scholarship
   */
  clearCache(scholarshipId?: number): void {
    if (scholarshipId) {
      this.cache.delete(scholarshipId);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    this.cache.forEach((cached, scholarshipId) => {
      if (now - cached.timestamp > this.cacheExpiration) {
        this.cache.delete(scholarshipId);
      }
    });
  }

  /**
   * Get readiness status badge color
   */
  getStatusColor(status: ReadinessResult['overallReadiness']): string {
    switch (status) {
      case 'ready':
        return '#10b981'; // Green
      case 'mostly-ready':
        return '#3b82f6'; // Blue
      case 'needs-improvement':
        return '#f59e0b'; // Orange
      case 'not-eligible':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  }

  /**
   * Get readiness status label
   */
  getStatusLabel(status: ReadinessResult['overallReadiness']): string {
    switch (status) {
      case 'ready':
        return '✅ Ready to Apply';
      case 'mostly-ready':
        return '💪 Mostly Ready';
      case 'needs-improvement':
        return '📝 Needs Improvement';
      case 'not-eligible':
        return '❌ Not Eligible';
      default:
        return 'Unknown';
    }
  }
}
