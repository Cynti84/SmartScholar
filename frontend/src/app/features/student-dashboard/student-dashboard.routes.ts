import { RouterModule, Routes } from '@angular/router';

import { Dashboard } from '../student-dashboard/dashboard/dashboard';
import { Scholarships } from './scholarships/scholarships';
import { Recommendations } from './recommendations/recommendations';
import { Applied } from './applied/applied';
import { Bookmarked } from './bookmarked/bookmarked';
import { Profile } from '../student-dashboard/profile/profile';

export const STUDENT_DASHBOARD_ROUTES: Routes = [
  { path: '', component: Dashboard },
  { path: 'scholarships', component: Scholarships },
  { path: 'recommendations', component: Recommendations },
  { path: 'applied', component: Applied },
  { path: 'bookmarked', component: Bookmarked },
  { path: 'profile', component: Profile },
];
