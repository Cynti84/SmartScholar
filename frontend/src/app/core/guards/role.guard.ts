/* src/app/core/guards/role.guard.ts */
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { parseJwt, isTokenExpired } from '../utils/token.util';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const allowedRoles: string[] = route.data['roles'] ?? [];

    const token = this.auth.getAccessToken();
    if (!token) {
      return this.router.parseUrl('/auth/login');
    }

    if (isTokenExpired(token)) {
      return this.router.parseUrl('/auth/login');
    }

    const user = parseJwt(token);
    if (!user) {
      return this.router.parseUrl('/auth/login');
    }

    const userRole = user.role;
    if (allowedRoles.length === 0) return true;
    if (allowedRoles.includes(userRole)) return true;

    return this.router.parseUrl('/not-authorized');
  }
}
