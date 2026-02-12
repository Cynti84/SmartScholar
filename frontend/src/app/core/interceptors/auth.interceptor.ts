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
    if (
      req.url.includes('/auth/login') ||
      req.url.includes('/auth/register') ||
      req.url.includes('/auth/signup') ||
      !access
    ) {
      return next.handle(req).pipe(
        catchError((err) => {
          // Only propagate actual server errors
          return throwError(() => err);
        }),
      );
    }
    const authReq = access ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } }) : req;

    return next.handle(authReq).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return this.handle401(authReq, next);
        }
        return throwError(() => err);
      }),
    );
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isRefreshing) {
      return throwError(() => new Error('Refresh already in progress'));
    }

    this.isRefreshing = true;

    return this.auth.refreshToken().pipe(
      switchMap((res: any) => {
        this.isRefreshing = false;

        const accessToken = res?.data?.accessToken;
        const refreshToken = res?.data?.refreshToken;

        if (!accessToken || !refreshToken) {
          throw new Error('Invalid refresh response');
        }

        this.auth.storeTokens(accessToken, refreshToken);

        const newReq = req.clone({
          setHeaders: { Authorization: `Bearer ${accessToken}` },
        });

        return next.handle(newReq);
      }),
      catchError((err) => {
        this.isRefreshing = false;
        this.auth.logout().subscribe();
        return throwError(() => err);
      }),
    );
  }
}
