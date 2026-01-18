import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { ScholarshipService } from '../../../core/services/scholarship.service';
import { UserScholarshipService } from '../../../core/services/user-scholarship.service';

// scholarship-ui.model.ts
interface ScholarshipUI {
  id: number;
  title: string;
  provider: string;
  country: string;
  level: string;
  fundingType: string;
  fieldOfStudy: string;
  amount: string;
  deadline: string; // ✅ CHANGE THIS
  description: string;
  eligibility: string[];
  fundingDetails: string;
  requirements: string[];
  isSaved: boolean;
}

interface Filters {
  keyword: string;
  country: string;
  level: string;
  fundingType: string;
  fieldOfStudy: string;
  deadlineBefore: string;
}

@Component({
  selector: 'app-scholarships',
  imports: [CommonModule, DashboardLayout, FormsModule, ReactiveFormsModule, ConfirmModal],
  templateUrl: './scholarships.html',
  styleUrl: './scholarships.scss',
})
export class Scholarships {
  menu = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
    { label: 'Logout', action: 'logout' },
  ];

  scholarships: ScholarshipUI[] = [];
  filteredScholarships: ScholarshipUI[] = [];
  selectedScholarship: ScholarshipUI | null = null;
  relatedScholarships: ScholarshipUI[] = [];

  filters: Filters = {
    keyword: '',
    country: '',
    level: '',
    fundingType: '',
    fieldOfStudy: '',
    deadlineBefore: '',
  };

  countries: string[] = [
    'USA',
    'UK',
    'Canada',
    'Australia',
    'Germany',
    'Netherlands',
    'Sweden',
    'Singapore',
  ];
  levels: string[] = ['Undergraduate', 'Masters', 'PhD', 'Postdoctoral'];
  fundingTypes: string[] = ['Full Funding', 'Partial Funding', 'Tuition Waiver'];
  fieldsOfStudy: string[] = [
    'Engineering',
    'Computer Science',
    'Business',
    'Medicine',
    'Arts',
    'Sciences',
    'Social Sciences',
    'Law',
  ];
  normalizeToArray(value: any): string[] {
    if (!value) return [];

    // Already an array
    if (Array.isArray(value)) return value;

    // Try parsing repeatedly (handles double-encoded JSON)
    try {
      let parsed = value;

      while (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }

      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v).trim());
      }
    } catch {
      // ignore
    }

    // Fallback: comma-separated string
    if (typeof value === 'string') {
      return value
        .replace(/[{}"]/g, '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    }

    return [];
  }

  sortBy: string = 'deadline';
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 1;

  showFilters: boolean = true;
  constructor(
    private authService: AuthService,
    private router: Router,
    private scholarshipService: ScholarshipService,
    private userScholarshipService: UserScholarshipService
  ) {}

  ngOnInit(): void {
    this.loadScholarships();
  }

  loadScholarships(): void {
    this.scholarshipService.getScholarships().subscribe({
      next: (res) => {
        this.scholarships = res.data.map((s) => this.mapToUI(s));
        this.filteredScholarships = [...this.scholarships];
      },
      error: (err) => console.error('Failed to load scholarships', err),
    });
  }

  mapToUI(s: any): ScholarshipUI {
    const eligibility: string[] = [];

    if (s.eligibility?.minGPA) {
      eligibility.push(`Minimum GPA: ${s.eligibility.minGPA}`);
    }
    if (s.eligibility?.educationLevel?.length) {
      eligibility.push(`Level: ${s.eligibility.educationLevel.join(', ')}`);
    }
    if (s.eligibility?.fieldOfStudy?.length) {
      eligibility.push(`Field: ${s.eligibility.fieldOfStudy.join(', ')}`);
    }
    if (s.eligibility?.countries?.length) {
      eligibility.push(`Countries: ${s.eligibility.countries.join(', ')}`);
    }
    const fields = this.normalizeToArray(s.fields_of_study);
    return {
      id: s.scholarship_id, // ✅ FIXED
      title: s.title ?? 'Untitled Scholarship',
      provider:
        s.organization_name ??
        (`${s.provider?.firstName ?? ''} ${s.provider?.lastName ?? ''}`.trim() ||
          'Unknown Provider'),

      country: s.country ?? 'Any',
      level: s.education_level ?? 'Any',
      fundingType: s.scholarship_type ?? 'Partial Funding',

      fieldOfStudy: fields[0] ?? 'Any',

      amount: s.scholarship_type ?? 'Varies',

      deadline: s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : '',

      description: s.description ?? '',
      eligibility:
        typeof s.eligibility_criteria === 'string'
          ? s.eligibility_criteria.split(',').map((e: string) => e.trim())
          : [],

      fundingDetails: s.application_link ?? '',
      requirements: [],
      isSaved: false,
    };
  }

  applyFilters(): void {
    let filtered = [...this.scholarships];

    // Keyword filter
    if (this.filters.keyword) {
      const keyword = this.filters.keyword.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(keyword) ||
          s.provider.toLowerCase().includes(keyword) ||
          s.fieldOfStudy.toLowerCase().includes(keyword) ||
          s.description.toLowerCase().includes(keyword)
      );
    }

    // Country filter
    if (this.filters.country) {
      filtered = filtered.filter((s) => s.country === this.filters.country);
    }

    // Level filter
    if (this.filters.level) {
      filtered = filtered.filter((s) => s.level === this.filters.level);
    }

    // Funding type filter
    if (this.filters.fundingType) {
      filtered = filtered.filter((s) => s.fundingType === this.filters.fundingType);
    }

    // Field of study filter
    if (this.filters.fieldOfStudy) {
      filtered = filtered.filter((s) => s.fieldOfStudy === this.filters.fieldOfStudy);
    }

    // Deadline filter
    if (this.filters.deadlineBefore) {
      filtered = filtered.filter(
        (s) => new Date(s.deadline) <= new Date(this.filters.deadlineBefore)
      );
    }

    // Sort
    this.sortScholarships(filtered);
    this.filteredScholarships = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  sortScholarships(scholarships: ScholarshipUI[]): void {
    scholarships.sort((a, b) => {
      switch (this.sortBy) {
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'amount':
          return this.extractAmount(b.amount) - this.extractAmount(a.amount);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }

  extractAmount(amount: string): number {
    const match = amount.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : 0;
  }

  clearFilters(): void {
    this.filters = {
      keyword: '',
      country: '',
      level: '',
      fundingType: '',
      fieldOfStudy: '',
      deadlineBefore: '',
    };
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  getPaginatedScholarships(): ScholarshipUI[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredScholarships.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  viewScholarship(s: ScholarshipUI): void {
    this.selectedScholarship = s;
    this.loadRelatedScholarships(s);
  }

  loadRelatedScholarships(s: ScholarshipUI): void {
    this.relatedScholarships = this.scholarships
      .filter(
        (x) =>
          x.id !== s.id &&
          (x.level === s.level || x.fieldOfStudy === s.fieldOfStudy || x.country === s.country)
      )
      .slice(0, 3);
  }

  backToList(): void {
    this.selectedScholarship = null;
  }
  toggleSave(scholarship: ScholarshipUI): void {
    if (!scholarship.id) {
      console.error('Scholarship ID is missing', scholarship);
      return;
    }

    if (scholarship.isSaved) {
      this.userScholarshipService.removeBookmark(scholarship.id).subscribe({
        next: () => (scholarship.isSaved = false),
        error: (err) => console.error('Failed to remove bookmark', err),
      });
    } else {
      this.userScholarshipService.bookmarkScholarship(scholarship.id).subscribe({
        next: () => (scholarship.isSaved = true),
        error: (err) => console.error('Failed to bookmark', err),
      });
    }
  }

  applyScholarship(scholarship: any): void {
    this.router.navigate(['/student/apply', scholarship.id]);
  }

  getDaysRemaining(deadline: string | Date): number {
    const today = new Date();
    const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);

    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  showLogoutModal = false;

  onSidebarAction(item: NavItem) {
    if (item.action === 'logout') {
      this.showLogoutModal = true;
    }
  }

  confirmLogout() {
    this.showLogoutModal = false;

    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }
}
