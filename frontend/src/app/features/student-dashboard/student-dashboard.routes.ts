import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { DashboardComponent } from '../student-dashboard/dashboard/dashboard';
import { Scholarships } from './scholarships/scholarships';

import { Applied } from './applied/applied';
import { Bookmarked } from './bookmarked/bookmarked';
import { Profile } from '../student-dashboard/profile/profile';

export const STUDENT_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['student'] },
  },
  {
    path: 'scholarships',
    component: Scholarships,
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['student'] },
  },

  {
    path: 'applied',
    component: Applied,
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['student'] },
  },
  {
    path: 'bookmarked',
    component: Bookmarked,
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['student'] },
  },
  {
    path: 'profile',
    component: Profile,
    // canActivate: [AuthGuard, RoleGuard],
    // data: { roles: ['student'] },
  },
];
