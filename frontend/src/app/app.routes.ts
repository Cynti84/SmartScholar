import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { RoleGuard } from './core/guards/role.guard';
import { Forbidden } from './shared/pages/forbidden/forbidden';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/landing/landing.routes').then((m) => m.LANDING_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () =>
      import('./features/admin-dashboard/admin-dashboard.routes').then(
        (m) => m.ADMIN_DASHBOARD_ROUTES
      ),
  },
  {
    path: 'provider',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['provider'] },
    loadChildren: () =>
      import('./features/provider-dashboard/provider-dashboard.routes').then(
        (m) => m.PROVIDER_DASHBOARD_ROUTES
      ),
  },
  {
    path: 'student',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['student'] },
    loadChildren: () =>
      import('./features/student-dashboard/student-dashboard.routes').then(
        (m) => m.STUDENT_DASHBOARD_ROUTES
      ),
    },
    {
        path: 'not-authorized',
        component: Forbidden
  }
];
