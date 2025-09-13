import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  // Navigation items
  navItems = [
    { label: 'Home', route: '/', },
    { label: 'About Us', route: '/about' },
    { label: 'FAQ', route: '/faq' },
  ];

  constructor(private router: Router) {}

  // Methods
  onGetStarted(): void {
    this.router.navigate(['/auth/signup']);
    console.log('Get Started clicked');
  } 

  onLogIn(): void {
    // Navigate to sign up page
    this.router.navigate(['/auth/login']);
    console.log('Sign Up clicked');
  }
}
