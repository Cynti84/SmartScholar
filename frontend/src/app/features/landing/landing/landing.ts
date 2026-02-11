import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { Router } from '@angular/router';
import {
  PublicScholarshipService,
  PublicScholarship,
} from '../../../core/services/PublicScholarship.Service';

export interface Scholarship {
  id: number;
  country: string;
  title: string;
  description: string;
  image: string;
  category: string;
}

@Component({
  selector: 'app-landing',
  imports: [CommonModule, RouterModule, MatIconModule, Navbar, Footer],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  heroLoaded: boolean = false;
  scholarshipsLoaded: boolean = false;

  scholarships: Scholarship[] = [];

  // Fallback images for different categories
  private fallbackImages: { [key: string]: string } = {
    undergraduate:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop',
    postgraduate:
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=250&fit=crop',
    research: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop',
    default: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop',
  };

  constructor(private scholarshipService: PublicScholarshipService, private router: Router) {}

  ngOnInit(): void {
    this.fetchLandingScholarships();
  }

  fetchLandingScholarships(): void {
    this.scholarshipService.getLandingScholarships().subscribe({
      next: (res) => {
        if (res.success) {
          this.scholarships = res.data.map((s) => ({
            id: s.scholarship_id,
            country: s.country,
            title: s.title,
            description: s.short_summary,
            image: s.banner_url || s.flyer_url || this.getFallbackImage(s.scholarship_type),
            category: s.scholarship_type,
          }));
        }
        this.scholarshipsLoaded = true;
      },
      error: (err) => {
        console.error('Failed to fetch scholarships', err);
        this.scholarshipsLoaded = true;
      },
    });
  }

  ngAfterViewInit() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.15 }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  /**
   * Get fallback image based on scholarship category
   */
  private getFallbackImage(category: string): string {
    const normalizedCategory = category?.toLowerCase() || 'default';
    return this.fallbackImages[normalizedCategory] || this.fallbackImages['default'];
  }

  /**
   * Handle image load errors with beautiful fallback images
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const card = img.closest('.scholarship-card');

    if (card) {
      const categoryBadge = card.querySelector('.card-badge');
      const category = categoryBadge?.textContent?.toLowerCase() || 'default';
      img.src = this.fallbackImages[category] || this.fallbackImages['default'];
    } else {
      img.src = this.fallbackImages['default'];
    }
  }

  onScholarshipClick(scholarship: Scholarship): void {
    console.log('Scholarship clicked:', scholarship);
    // Navigate to scholarship detail page
    // this.router.navigate(['/scholarships', scholarship.id]);
  }

  onGetStarted(): void {
    this.router.navigate(['/auth/signup']);
    console.log('Get Started clicked');
  }
}
