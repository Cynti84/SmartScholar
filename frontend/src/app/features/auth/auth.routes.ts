import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { StudentSignup } from './student-signup/student-signup';
import { ProviderSignup } from './provider-signup/provider-signup';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
import { ResetPasswordComponent } from './reset-password/reset-password';

import { Terms } from './terms/terms';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  {
    path: 'signup/student',
    component: StudentSignup,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['student'] },
  },
  {
    path: 'signup/provider',
    component: ProviderSignup,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['provider'] },
  },

  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },

  { path: 'terms', component: Terms },
];
