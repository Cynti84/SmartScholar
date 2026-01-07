import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { StudentSignup } from './student-signup/student-signup';
import { ProviderSignup } from './provider-signup/provider-signup';
import { Terms } from './terms/terms';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'signup/student', component: StudentSignup },
  { path: 'signup/provider', component: ProviderSignup },
  { path: 'terms', component: Terms }
  
];
