import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

export interface SavedScholarship {
  id: string;
  scholarshipId: string;
  title: string;
  provider: string;
  providerLogo?: string;
  amount: number;
  deadline: Date;
  category: string;
  description: string;
  matchScore?: number;
  savedDate: Date;
  tags?: string[];
  notes?: string;
  status: 'active' | 'expired' | 'applied';
}
@Component({
  selector: 'app-bookmarked',
  imports: [CommonModule, DashboardLayout, FormsModule, ConfirmModal],
  templateUrl: './bookmarked.html',
  styleUrl: './bookmarked.scss',
})
export class Bookmarked {
  menu = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
    { label: 'Logout', action: 'logout' },
  ];
  savedScholarships: SavedScholarship[] = [];
  filteredScholarships: SavedScholarship[] = [];

  isLoading = true;

  // Filters
  searchTerm = '';
  selectedCategory = 'all';
  selectedStatus = 'all';
  sortBy = 'saved_date'; // saved_date, deadline, amount, match_score

  // Categories
  categories: string[] = [];

  // View mode
  viewMode: 'grid' | 'list' = 'grid';

  // Stats
  stats = {
    total: 0,
    active: 0,
    expired: 0,
    applied: 0,
  };

  // Selected scholarships for bulk actions
  selectedScholarshipIds: Set<string> = new Set();
  isSelectionMode = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadSavedScholarships();
  }

  loadSavedScholarships(): void {
    this.isLoading = true;

    // Simulate API call with mock data
    setTimeout(() => {
      this.savedScholarships = [
        {
          id: '1',
          scholarshipId: 'sch-001',
          title: 'Tech Excellence Award 2025',
          provider: 'TechCorp Foundation',
          providerLogo: 'https://via.placeholder.com/50',
          amount: 5000,
          deadline: new Date('2025-12-31'),
          category: 'Engineering',
          description:
            'Supporting outstanding students in technology fields pursuing innovative projects and research.',
          matchScore: 92,
          savedDate: new Date('2025-11-01'),
          tags: ['Tech', 'High Match'],
          notes: 'Great opportunity for my AI project. Need to prepare portfolio.',
          status: 'active',
        },
        {
          id: '2',
          scholarshipId: 'sch-002',
          title: 'Medical Students Excellence Grant',
          provider: 'Health Foundation',
          amount: 7500,
          deadline: new Date('2025-11-20'),
          category: 'Medicine',
          description:
            'Financial aid for medical students demonstrating academic excellence and community service.',
          matchScore: 78,
          savedDate: new Date('2025-10-28'),
          tags: ['Healthcare'],
          status: 'active',
        },
        {
          id: '3',
          scholarshipId: 'sch-003',
          title: 'Engineering Innovation Prize',
          provider: 'Innovation Hub',
          amount: 4000,
          deadline: new Date('2025-11-15'),
          category: 'Engineering',
          description:
            'Awarded to students developing innovative solutions to real-world engineering challenges.',
          matchScore: 88,
          savedDate: new Date('2025-10-25'),
          status: 'applied',
        },
        {
          id: '4',
          scholarshipId: 'sch-004',
          title: 'Arts & Culture Scholarship',
          provider: 'Cultural Society',
          amount: 3000,
          deadline: new Date('2025-10-10'),
          category: 'Arts',
          description: 'Promoting artistic excellence and cultural awareness among students.',
          savedDate: new Date('2025-09-15'),
          tags: ['Arts', 'Culture'],
          status: 'expired',
        },
        {
          id: '5',
          scholarshipId: 'sch-005',
          title: 'Business Leadership Award',
          provider: 'Business School',
          amount: 6000,
          deadline: new Date('2025-12-20'),
          category: 'Business',
          description:
            'Supporting future business leaders with entrepreneurial vision and leadership skills.',
          matchScore: 85,
          savedDate: new Date('2025-10-30'),
          notes: 'Need to get recommendation letters from professors.',
          status: 'active',
        },
        {
          id: '6',
          scholarshipId: 'sch-006',
          title: 'STEM Diversity Scholarship',
          provider: 'Global Education Fund',
          amount: 8000,
          deadline: new Date('2025-11-25'),
          category: 'Science',
          description:
            'Promoting diversity in STEM fields through financial support for underrepresented students.',
          matchScore: 90,
          savedDate: new Date('2025-10-20'),
          tags: ['STEM', 'Diversity', 'Must Apply'],
          status: 'active',
        },
      ];

      this.filteredScholarships = [...this.savedScholarships];
      this.extractCategories();
      this.calculateStats();
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  extractCategories(): void {
    const uniqueCategories = new Set(this.savedScholarships.map((s) => s.category));
    this.categories = Array.from(uniqueCategories).sort();
  }

  calculateStats(): void {
    this.stats.total = this.savedScholarships.length;
    this.stats.active = this.savedScholarships.filter((s) => s.status === 'active').length;
    this.stats.expired = this.savedScholarships.filter((s) => s.status === 'expired').length;
    this.stats.applied = this.savedScholarships.filter((s) => s.status === 'applied').length;
  }

  applyFilters(): void {
    let filtered = [...this.savedScholarships];

    // Search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(search) ||
          s.provider.toLowerCase().includes(search) ||
          s.description.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter((s) => s.category === this.selectedCategory);
    }

    // Status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter((s) => s.status === this.selectedStatus);
    }

    // Sort
    this.sortScholarships(filtered);

    this.filteredScholarships = filtered;
  }

  sortScholarships(scholarships: SavedScholarship[]): void {
    scholarships.sort((a, b) => {
      switch (this.sortBy) {
        case 'saved_date':
          return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'match_score':
          return (b.matchScore || 0) - (a.matchScore || 0);
        default:
          return 0;
      }
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  unsaveScholarship(scholarship: SavedScholarship, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (confirm(`Remove "${scholarship.title}" from saved scholarships?`)) {
      this.savedScholarships = this.savedScholarships.filter(
        (s) => s.scholarshipId !== scholarship.scholarshipId
      );
      this.calculateStats();
      this.applyFilters();
    }
  }

  viewScholarship(scholarship: SavedScholarship): void {
    this.router.navigate(['/scholarships', scholarship.scholarshipId]);
  }

  applyToScholarship(scholarship: SavedScholarship, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/scholarships', scholarship.scholarshipId, 'apply']);
  }

  formatDeadline(deadline: Date): string {
    const date = new Date(deadline);
    const now = new Date();
    const diff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Due Today';
    if (diff === 1) return 'Due Tomorrow';
    if (diff < 7) return `${diff} days left`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks left`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getDeadlineClass(deadline: Date): string {
    const date = new Date(deadline);
    const now = new Date();
    const diff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return 'expired';
    if (diff < 7) return 'urgent';
    if (diff < 30) return 'soon';
    return 'normal';
  }

  toggleSelectionMode(): void {
    this.isSelectionMode = !this.isSelectionMode;
    if (!this.isSelectionMode) {
      this.selectedScholarshipIds.clear();
    }
  }

  toggleScholarshipSelection(scholarshipId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.selectedScholarshipIds.has(scholarshipId)) {
      this.selectedScholarshipIds.delete(scholarshipId);
    } else {
      this.selectedScholarshipIds.add(scholarshipId);
    }
  }

  selectAll(): void {
    this.filteredScholarships.forEach((s) => {
      this.selectedScholarshipIds.add(s.scholarshipId);
    });
  }

  deselectAll(): void {
    this.selectedScholarshipIds.clear();
  }

  bulkUnsave(): void {
    if (this.selectedScholarshipIds.size === 0) return;

    if (confirm(`Remove ${this.selectedScholarshipIds.size} scholarships from saved?`)) {
      this.savedScholarships = this.savedScholarships.filter(
        (s) => !this.selectedScholarshipIds.has(s.scholarshipId)
      );
      this.calculateStats();
      this.applyFilters();
      this.selectedScholarshipIds.clear();
      this.isSelectionMode = false;
    }
  }

  exportSaved(): void {
    console.log('Exporting saved scholarships...');
    alert('Export feature: Download CSV/PDF of your saved scholarships');
  }

  Math = Math;

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
