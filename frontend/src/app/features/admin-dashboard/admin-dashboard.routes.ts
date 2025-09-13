import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from '../admin-dashboard/dashboard/dashboard';
import { ProviderManagement } from './provider-management/provider-management';
import { StudentManagement } from './student-management/student-management';
import { ScholarshipManagement } from './scholarship-management/scholarship-management';
import { Reports } from './reports/reports';

export const ADMIN_DASHBOARD_ROUTES: Routes = [
  { path: '', component: Dashboard },
  { path: 'providers', component: ProviderManagement },
  { path: 'reports', component: Reports },
  { path: 'scholarships', component: ScholarshipManagement },
  { path: 'students', component: StudentManagement },
];