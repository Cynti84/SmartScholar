import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';
import { MatIconModule } from '@angular/material/icon';

interface Statistic {
  number: string;
  label: string;
  description: string;
}

interface CoreValue {
  icon: string;
  title: string;
  description: string;
  class: string;
}

interface TeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-about-us',
  imports: [CommonModule, RouterModule, Navbar, Footer, MatIconModule],
  templateUrl: './about-us.html',
  styleUrl: './about-us.scss',
})
export class AboutUs {
  private router = inject(Router);

  // Statistics data
  statistics: Statistic[] = [
    {
      number: '10,000+',
      label: 'Students Helped',
      description: 'Students who found scholarships through our platform',
    },
    {
      number: '500+',
      label: 'Partner Institutions',
      description: 'Universities and organizations offering scholarships',
    },
    {
      number: '50+',
      label: 'Countries',
      description: 'Countries where our students have studied',
    },
    {
      number: '$50M+',
      label: 'Scholarships Awarded',
      description: 'Total value of scholarships facilitated',
    },
  ];

  // Core values data
  coreValues: CoreValue[] = [
    {
      icon: 'handshake', // 🤝
      title: 'Accessibility',
      class: 'accessibility',
      description:
        'Making quality education accessible to students from all backgrounds and financial situations.',
    },
    {
      icon: 'emoji_events', // ✨
      title: 'Excellence',
      class: 'excellence',
      description:
        'Maintaining the highest standards in matching students with the right educational opportunities.',
    },
    {
      icon: 'visibility', // 🔍
      title: 'Transparency',
      class: 'transparency',
      description:
        'Providing clear, honest information about scholarship opportunities and application processes.',
    },
    {
      icon: 'trending_up', // 🌱
      title: 'Growth',
      class: 'growth',
      description:
        'Supporting student growth and development throughout their educational journey.',
    },
    {
      icon: 'psychology', // 🤖
      title: 'Innovation',
      class: 'innovation',
      description:
        'Leveraging cutting-edge technology to improve the scholarship matching process.',
    },
    {
      icon: 'public', // 🌟
      title: 'Impact',
      class: 'impact',
      description: "Creating lasting positive change in students' lives through education access.",
    },
  ];

  // Team members data
  teamMembers: TeamMember[] = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      description: 'Former scholarship recipient with 15+ years in education technology.',
      image: 'team-sarah.jpg',
    },
    {
      name: 'Michael Chen',
      role: 'Chief Technology Officer',
      description: 'AI and machine learning expert passionate about education accessibility.',
      image: 'team-michael.jpg',
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Head of Partnerships',
      description:
        'Former university admissions director with extensive scholarship program experience.',
      image: 'team-emily.jpg',
    },
    {
      name: 'David Thompson',
      role: 'Student Success Manager',
      description: 'Dedicated to guiding students through their scholarship application journey.',
      image: 'team-david.jpg',
    },
  ];

  // Navigation methods
  onGetStarted(): void {
    this.router.navigate(['/auth/signup']);
  }

  onExploreScholarships(): void {
    this.router.navigate(['/scholarships']);
  }

  // Helper method for team member placeholder images
  getTeamPlaceholder(name: string): string {
    return `this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&size=300&background=3b82f6&color=ffffff'`;
  }
}
