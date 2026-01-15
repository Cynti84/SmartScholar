import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { UserScholarshipService } from '../../../core/services/user-scholarship.service';

export interface SavedScholarship {
  id: number;
  scholarshipId: number;

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
  selectedScholarshipIds: Set<number> = new Set();

  isSelectionMode = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userScholarshipService: UserScholarshipService
  ) {}

  ngOnInit(): void {
    this.loadSavedScholarships();
  }
  loadSavedScholarships(): void {
    this.isLoading = true;

    this.userScholarshipService.getBookmarkedScholarships().subscribe({
      next: (res) => {
        this.savedScholarships = res.data
          .filter((b: any) => b.scholarship)
          .map((b: any) => ({
            id: b.id, // ✅ REQUIRED (bookmark id)

            scholarshipId: b.scholarshipId, // ✅ from bookmark table

            title: b.scholarship.title,
            provider: b.scholarship.organization_name,
            description: b.scholarship.short_summary,
            deadline: new Date(b.scholarship.deadline),
            category: b.scholarship.education_level,
            amount: 0,

            status: this.computeStatus(b.scholarship),
            savedDate: new Date(b.bookmarkedAt),

            providerLogo: b.scholarship.banner_url ?? null,
            tags: b.scholarship.fields_of_study?.split(',') ?? [],
          }));

        this.filteredScholarships = [...this.savedScholarships];

        // 🔴 MISSING CALLS
        this.extractCategories();
        this.calculateStats();

        this.isLoading = false;
      },
    });
  }

  computeStatus(scholarship: any): 'active' | 'expired' | 'applied' {
    const deadline = new Date(scholarship.deadline);
    const now = new Date();

    if (deadline < now) {
      return 'expired';
    }

    // later you can improve this if student has applied
    return 'active';
  }

  // Simulate API call with mock data

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
    event?.stopPropagation();

    if (!confirm(`Remove "${scholarship.title}" from saved scholarships?`)) return;

    this.userScholarshipService.removeBookmark(scholarship.scholarshipId).subscribe({
      next: () => {
        this.savedScholarships = this.savedScholarships.filter(
          (s) => s.scholarshipId !== scholarship.scholarshipId
        );
        this.calculateStats();
        this.applyFilters();
      },
      error: () => alert('Failed to remove bookmark'),
    });
  }

  viewScholarship(scholarship: SavedScholarship): void {
    this.router.navigate(['/student/scholarships', scholarship.scholarshipId]);
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

  toggleScholarshipSelection(scholarshipId: number, event?: Event): void {
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
