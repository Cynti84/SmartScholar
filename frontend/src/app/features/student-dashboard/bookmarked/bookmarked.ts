import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { FormsModule } from '@angular/forms';

interface Scholarship {
  title: string;
  country: string;
  deadline: string;
  status: 'ongoing' | 'expired';
  icon?: string;
}

@Component({
  selector: 'app-bookmarked',
  imports: [CommonModule, DashboardLayout, FormsModule],
  templateUrl: './bookmarked.html',
  styleUrl: './bookmarked.scss',
})
export class Bookmarked {
  menu = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Recommendations', route: '/student/recommendations' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
  ];
  searchTerm = '';
  scholarships: Scholarship[] = [
    {
      title: 'Mastercard Foundation Scholarship',
      country: 'Kenya',
      deadline: 'Dec 1, 2025',
      status: 'ongoing',
      icon: '💡',
    },
    {
      title: 'Equity Leaders Program',
      country: 'Kenya',
      deadline: 'Dec 1, 2025',
      status: 'ongoing',
      icon: '🎓',
    },
    {
      title: 'GDSC Scholarship',
      country: 'Kenya',
      deadline: 'Dec 1, 2025',
      status: 'ongoing',
      icon: '💡',
    },
  ];

  get total() {
    return this.scholarships.length;
  }

  get ongoing() {
    return this.scholarships.filter((s) => s.status === 'ongoing').length;
  }

  get expired() {
    return this.scholarships.filter((s) => s.status === 'expired').length;
  }

  filteredScholarships() {
    return this.scholarships.filter((s) =>
      s.title.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
