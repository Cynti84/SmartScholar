import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProviderService } from '../../../core/services/provider.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

interface ScholarshipAnalytics {
  views: number;
  bookmarks: number;
  applications: number;
}

interface Scholarship {
  id: string;
  title: string;
  shortSummary: string;
  organizationName: string;
  country: string;
  educationLevel: string;
  scholarshipType: string;
  fieldsOfStudy: string[];
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  applicationDeadline: Date;
  dateCreated: Date;
  analytics: ScholarshipAnalytics;
}

type ViewMode = 'table' | 'cards';
type SortOption = 'dateCreated' | 'title' | 'applications' | 'views';

@Component({
  selector: 'app-manage-scholaships',
  imports: [CommonModule, DashboardLayout, FormsModule, ConfirmModal],
  templateUrl: './manage-scholaships.html',
  styleUrl: './manage-scholaships.scss',
})
export class ManageScholaships implements OnInit {
  // =========================
  // MENU
  // =========================
  menu = [
    { label: 'Overview', route: '/provider' },
    { label: 'Post Scholarships', route: '/provider/post' },
    { label: 'Manage Scholarships', route: '/provider/manage' },
    { label: 'Applicants', route: '/provider/applicants' },
    { label: 'Profile', route: '/provider/profile' },
    { label: 'Logout', action: 'logout' },
  ];

  // =========================
  // STATE
  // =========================
  scholarships: Scholarship[] = [];
  filteredScholarships: Scholarship[] = [];
  selectedScholarships: string[] = [];
  viewMode: ViewMode = 'table';

  loading = false;
  error = '';

  // =========================
  // MODALS
  // =========================
  showViewModal = false;
  showEditModal = false;
  currentScholarship: Scholarship | null = null;
  editingScholarship: Scholarship | null = null;

  // =========================
  // FILTERS
  // =========================
  searchTerm = '';
  statusFilter = '';
  sortBy: SortOption = 'dateCreated';
  showExpiredOnly = false;

  showLogoutModal = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private providerService: ProviderService
  ) {}

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {
    this.loadScholarships();
  }

  // =========================
  // LOAD FROM API
  // =========================
  private loadScholarships(): void {
    this.loading = true;
    this.error = '';

    this.providerService.getMyScholarships().subscribe({
      next: (res: any) => {
        const rows: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

        this.scholarships = rows
          .filter((s) => s && s.scholarship_id) // 👈 important guard
          .map((s) => this.mapScholarship(s));

        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Load scholarships failed:', err);
        this.error = 'Failed to load scholarships';
        this.loading = false;
      },
    });
  }

  // =========================
  // MAP API → UI MODEL
  // =========================
  private mapScholarship(api: any): Scholarship {
    if (!api) {
      console.warn('mapScholarship called with invalid value:', api);
      return null as any;
    }

    return {
      id: String(api.scholarship_id),
      title: api.title ?? '',
      shortSummary: api.short_summary ?? '',
      organizationName: api.organization_name ?? '',
      country: api.country ?? '',
      educationLevel: api.education_level ?? '',
      scholarshipType: api.scholarship_type ?? '',
      fieldsOfStudy: Array.isArray(api.fields_of_study)
        ? api.fields_of_study.flatMap((f: string) =>
            typeof f === 'string' ? f.split(',').map((v) => v.trim()) : []
          )
        : typeof api.fields_of_study === 'string'
        ? api.fields_of_study.split(',').map((v: string) => v.trim())
        : [],
      status: api.status ?? 'draft',
      applicationDeadline: new Date(api.deadline),
      dateCreated: new Date(api.created_at),
      analytics: {
        views: api.views ?? 0,
        bookmarks: api.bookmarks ?? 0,
        applications: api.applications ?? 0,
      },
    };
  }

  // =========================
  // FILTERING & SORTING
  // =========================
  applyFilters(): void {
    let filtered = [...this.scholarships];

    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.shortSummary.toLowerCase().includes(q) ||
          s.organizationName.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.fieldsOfStudy.some((f) => f.toLowerCase().includes(q))
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter((s) => s.status === this.statusFilter);
    }

    if (this.showExpiredOnly) {
      filtered = filtered.filter((s) => this.isExpired(s.applicationDeadline));
    }

    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'applications':
          return b.analytics.applications - a.analytics.applications;
        case 'views':
          return b.analytics.views - a.analytics.views;
        default:
          return b.dateCreated.getTime() - a.dateCreated.getTime();
      }
    });

    this.filteredScholarships = filtered;
  }

  // =========================
  // VIEW
  // =========================
  viewScholarship(s: Scholarship): void {
    console.log('Showing scholarship...');
    this.providerService.getScholarshipById(+s.id).subscribe({
      next: (res) => {
        this.currentScholarship = this.mapScholarship(res);
        console.log('Showing scholarship', res);
        this.showViewModal = true;
      },
    });
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.currentScholarship = null;
  }

  // =========================
  // EDIT
  // =========================
  editScholarship(s: Scholarship): void {
    if (s.status === 'rejected') {
      alert('Rejected scholarships cannot be edited.');
      return;
    }

    this.editingScholarship = JSON.parse(JSON.stringify(s));
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingScholarship = null;
  }

  saveEditedScholarship(): void {
    if (!this.editingScholarship) return;

    const formData = new FormData();
    Object.entries(this.editingScholarship).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
      }
    });

    this.providerService.updateScholarship(+this.editingScholarship.id, formData).subscribe({
      next: () => {
        this.showNotification('Scholarship updated', 'success');
        this.closeEditModal();
        this.loadScholarships();
      },
      error: () => {
        this.showNotification('Update failed', 'error');
      },
    });
  }

  // =========================
  // DELETE
  // =========================
  deleteScholarship(s: Scholarship): void {
    if (!confirm(`Delete "${s.title}"?`)) return;

    this.providerService.deleteScholarship(+s.id).subscribe({
      next: () => {
        this.showNotification('Scholarship deleted', 'success');
        this.loadScholarships();
      },
      error: () => {
        this.showNotification('Delete failed', 'error');
      },
    });
  }

  bulkDelete(): void {
    if (this.selectedScholarships.length === 0) return;

    if (!confirm(`Delete ${this.selectedScholarships.length} scholarships?`)) return;

    Promise.all(
      this.selectedScholarships.map((id) => this.providerService.deleteScholarship(+id).toPromise())
    ).then(() => {
      this.clearSelection();
      this.loadScholarships();
      this.showNotification('Scholarships deleted', 'success');
    });
  }

  // =========================
  // UTILITIES
  // =========================
  isExpired(date: Date): boolean {
    return new Date() > new Date(date);
  }

  toggleSelection(id: string): void {
    this.selectedScholarships.includes(id)
      ? (this.selectedScholarships = this.selectedScholarships.filter((x) => x !== id))
      : this.selectedScholarships.push(id);
  }

  clearSelection(): void {
    this.selectedScholarships = [];
  }

  navigateToPost(): void {
    this.router.navigate(['/provider/post']);
  }

  trackByScholarshipId(_: number, s: Scholarship): string {
    return s.id;
  }

  private showNotification(msg: string, type: 'success' | 'error' | 'info' = 'info'): void {
    alert(msg);
  }

  /* ===============================
   Dashboard / Summary helpers
   =============================== */

  getTotalScholarships(): number {
    return this.scholarships.length;
  }

  getScholarshipsByStatus(status: 'pending' | 'approved' | 'rejected' | 'expired'): Scholarship[] {
    return this.scholarships.filter((s) => s.status === status);
  }

  getTotalApplications(): number {
    return this.scholarships.reduce((total, s) => total + (s.analytics?.applications ?? 0), 0);
  }

  /* ===============================
   View & filter helpers
   =============================== */

  toggleExpiredOnly(): void {
    this.showExpiredOnly = !this.showExpiredOnly;
    this.applyFilters();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  /* ===============================
   UI formatting helpers
   =============================== */

  getStatusClass(status: Scholarship['status']): string {
    return status.toLowerCase(); // pending | approved | rejected | expired
  }

  getDeadlineText(deadline: Date): string {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    if (diffDays <= 30) return `${diffDays} days left`;

    return `${Math.ceil(diffDays / 30)} months left`;
  }

  isDeadlineSoon(deadline: Date): boolean {
    const now = new Date();
    const daysUntilDeadline = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDeadline <= 30 && daysUntilDeadline > 0;
  }

  //Helper method to formate date for input field
  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // helper method to update deadline from input
  updateDeadline(dateString: string): void {
    if (this.editingScholarship) {
      this.editingScholarship.applicationDeadline = new Date(dateString);
    }
  }

  // Export/Report methods
  exportToCSV(): void {
    const csvData = this.convertToCSV(this.filteredScholarships);
    this.downloadCSV(csvData, 'scholarships-export.csv');
  }
  private convertToCSV(data: Scholarship[]): string {
    const headers = [
      'Title',
      'Status',
      'Country',
      'Education Level',
      'Deadline',
      'Views',
      'Applications',
      'Date Created',
    ];
    const csvContent = [
      headers.join(','),
      ...data.map((scholarship) =>
        [
          '${scholarship.title}',
          scholarship.status,
          scholarship.country,
          scholarship.educationLevel,
          scholarship.applicationDeadline.toISOString().split('T')[0],
          scholarship.analytics.views,
          scholarship.analytics.applications,
          scholarship.dateCreated.toISOString().split('T')[0],
        ].join(',')
      ),
    ].join('\n');
    return csvContent;
  }
  private downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  // Refresh data
  refreshData(): void {
    console.log('Refreshing scholarship data...');
    this.loadScholarships();
    this.applyFilters();
    this.showNotification('Data refreshed successfully', 'success');
  }

  // =========================
  // LOGOUT
  // =========================
  onSidebarAction(item: NavItem) {
    if (item.action === 'logout') this.showLogoutModal = true;
  }

  confirmLogout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }
}
