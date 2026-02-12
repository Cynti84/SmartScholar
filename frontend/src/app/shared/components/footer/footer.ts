import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  // Footer links
  footerLinks = [
    { label: 'About', route: '/about' },
    { label: 'FAQ', route: '/faq' },
    // { label: 'Pricing', route: '/pricing' },
    // { label: 'Gallery', route: '/gallery' },
    // { label: 'Team', route: '/team' },
  ];

  // socialLinks = [
  //   { icon: 'fab fa-facebook', url: 'https://facebook.com', label: 'Facebook' },
  //   { icon: 'fab fa-instagram', url: 'https://instagram.com', label: 'Instagram' },
  //   { icon: 'fab fa-youtube', url: 'https://youtube.com', label: 'YouTube' },
  //   { icon: 'fab fa-linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
  // ];

  onSocialClick(url: string): void {
    window.open(url, '_blank');
  }
}
