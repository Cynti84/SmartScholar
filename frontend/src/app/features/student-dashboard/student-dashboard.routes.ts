import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { Dashboard } from '../student-dashboard/dashboard/dashboard';
import { Scholarships } from './scholarships/scholarships';

import { Applied } from './applied/applied';
import { Bookmarked } from './bookmarked/bookmarked';
import { Profile } from '../student-dashboard/profile/profile';

export const STUDENT_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: Dashboard,
  },
  {
    path: 'scholarships',
    component: Scholarships,
  },

  {
    path: 'applied',
    component: Applied,
  },
  {
    path: 'bookmarked',
    component: Bookmarked,
  },
  {
    path: 'profile',
    component: Profile,
  },
];
