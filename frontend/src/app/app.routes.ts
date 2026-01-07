import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () =>
        import('./features/landing/landing.routes').then(m=> m.LANDING_ROUTES),    
    },
    {
        path: 'auth',
        loadChildren: () =>
            import('./features/auth/auth.routes').then(m=>m.AUTH_ROUTES)
    },
    {
        path: 'admin',
        loadChildren: () =>
            import('./features/admin-dashboard/admin-dashboard.routes').then(m=> m.ADMIN_DASHBOARD_ROUTES)
    },
    {
        path: 'provider',
        loadChildren: () =>
            import('./features/provider-dashboard/provider-dashboard.routes').then(m=>m.PROVIDER_DASHBOARD_ROUTES)
    },
    {
        path: 'student',
        loadChildren: () =>
            import('./features/student-dashboard/student-dashboard.routes').then(m => m.STUDENT_DASHBOARD_ROUTES)
    }
];
