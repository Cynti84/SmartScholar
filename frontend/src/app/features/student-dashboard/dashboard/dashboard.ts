import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
interface Scholarship {
  id: number;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  matchScore: number;
  category: string;
}

interface OverviewStats {
  totalScholarships: number;
  applied: number;
  pending: number;
  approved: number;
  rejected: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DashboardLayout],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  menu = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Recommendations', route: '/student/recommendations' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
  ];
  studentName: string = 'John Doe';

  stats: OverviewStats = {
    totalScholarships: 156,
    applied: 12,
    pending: 8,
    approved: 3,
    rejected: 1,
  };

  recommendedScholarships: Scholarship[] = [
    {
      id: 1,
      title: 'Merit-Based Excellence Scholarship',
      provider: 'National Education Foundation',
      amount: '$5,000',
      deadline: '2025-12-15',
      matchScore: 95,
      category: 'Academic',
    },
    {
      id: 2,
      title: 'STEM Innovation Award',
      provider: 'Tech Leaders Alliance',
      amount: '$7,500',
      deadline: '2025-11-30',
      matchScore: 88,
      category: 'STEM',
    },
    {
      id: 3,
      title: 'Community Leadership Grant',
      provider: 'Civic Engagement Institute',
      amount: '$3,000',
      deadline: '2025-12-01',
      matchScore: 82,
      category: 'Leadership',
    },
    {
      id: 4,
      title: 'First Generation Student Support',
      provider: 'Educational Access Foundation',
      amount: '$4,500',
      deadline: '2025-12-20',
      matchScore: 78,
      category: 'Need-Based',
    },
  ];

  ngOnInit(): void {
    // Initialize component
  }

  getDaysRemaining(deadline: string): number {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  onApplyNow(): void {
    console.log('Navigate to scholarship applications');
  }

  onViewSaved(): void {
    console.log('Navigate to saved scholarships');
  }

  onEditProfile(): void {
    console.log('Navigate to profile edit');
  }

  onViewScholarship(id: number): void {
    console.log('View scholarship details:', id);
  }
}
