import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const access = this.auth.getAccessToken();
    let authReq = req;

    if (access) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${access}` },
      });
    }

    return next.handle(authReq).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return this.handle401(authReq, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      return this.auth.refreshToken().pipe(
        switchMap((tokens) => {
          this.isRefreshing = false;

          // Save new tokens
          this.auth.storeTokens(tokens.accessToken, tokens.refreshToken);

          // Retry original request with new access token
          const newReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          });

          return next.handle(newReq);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.auth.logout();
          return throwError(() => err);
        })
      );
    }

    // If a refresh is already in progress → block or queue requests
    return throwError(() => new Error('Request blocked while refreshing token'));
  }
}
