import { RouterModule, Routes } from '@angular/router';

import { Dashboard } from '../provider-dashboard/dashboard/dashboard';
import { ManageScholaships } from './manage-scholaships/manage-scholaships';
import { PostScholarships } from './post-scholarships/post-scholarships';
import { Applicants } from './applicants/applicants';
import { Profile } from '../provider-dashboard/profile/profile';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const PROVIDER_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: Dashboard,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['provider'] },
  },
  {
    path: 'manage',
    component: ManageScholaships,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['provider'] },
  },
  {
    path: 'post',
    component: PostScholarships,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['provider'] },
  },
  {
    path: 'applicants',
    component: Applicants,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['provider'] },
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['provider'] },
  },
];
