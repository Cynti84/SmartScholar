import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  imports: [CommonModule, RouterModule, Navbar, Footer],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  heroLoaded: boolean = false;
  scholarshipsLoaded: boolean = false;

  scholarships: Scholarship[] = [];

  constructor(
    private scholarshipService: PublicScholarshipService,
    private router: Router,
  ) {}

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
            image: s.banner_url || s.flyer_url || 'default-image.jpg',
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
      { threshold: 0.15 },
    );

    reveals.forEach((el) => observer.observe(el));
  }

  onScholarshipClick(scholarship: Scholarship): void {
    console.log('Scholarship clicked:', scholarship);
  }

  onGetStarted(): void {
    this.router.navigate(['/auth/signup']);
    console.log('Get Started clicked');
  }
}
