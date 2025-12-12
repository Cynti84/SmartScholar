/* src/app/core/guards/auth.guard.ts */
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isTokenExpired } from '../utils/token.util';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = this.auth.getAccessToken();

    // If no token, force login
    if (!token) {
      return this.router.parseUrl('/auth/login');
    }

    // If token looks expired, force login
    if (isTokenExpired(token)) {
      // optionally clear tokens here: this.auth.logout().subscribe();
      return this.router.parseUrl('/auth/login');
    }

    // OK
    return true;
  }
}
