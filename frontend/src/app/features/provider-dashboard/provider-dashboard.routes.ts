import { RouterModule, Routes } from '@angular/router';

import { Dashboard } from '../provider-dashboard/dashboard/dashboard';
import { ManageScholaships } from './manage-scholaships/manage-scholaships';
import { PostScholarships } from './post-scholarships/post-scholarships';
import { Applicants } from './applicants/applicants';
import { Profile } from '../provider-dashboard/profile/profile';

export const PROVIDER_DASHBOARD_ROUTES: Routes = [
  { path: '', component: Dashboard },
  { path: 'manage', component: ManageScholaships },
  { path: 'post', component: PostScholarships },
  { path: 'applicants', component: Applicants },
  { path: 'profile', component: Profile },
];
