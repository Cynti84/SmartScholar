import { RouterModule, Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { AboutUs } from './about-us/about-us';
import { Faq } from './faq/faq';
import { Testimonials } from './testimonials/testimonials';

export const LANDING_ROUTES: Routes = [
    { path: '', component: Landing },
    { path: 'about', component: AboutUs },
    { path: 'faq', component: Faq },
    { path: 'testimonials', component: Testimonials }
    
];
