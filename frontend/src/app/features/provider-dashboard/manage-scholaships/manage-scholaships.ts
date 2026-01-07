import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
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
  status: 'Pending' | 'Approved' | 'Rejected' | 'Expired';
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
  //menu for navigation
  menu = [
    { label: 'Overview', route: '/provider' },
    { label: 'Post Scholarships', route: '/provider/post' },
    { label: 'Manage Scholarships', route: '/provider/manage' },
    { label: 'Applicants', route: '/provider/applicants' },
    { label: 'Profile', route: '/provider/profile' },
    { label: 'Logout', action: 'logout' },
  ];

  // Component state
  scholarships: Scholarship[] = [];
  filteredScholarships: Scholarship[] = [];
  selectedScholarships: string[] = [];
  viewMode: ViewMode = 'table';

  // Modal state
  showViewModal = false;
  showEditModal = false;
  currentScholarship: Scholarship | null = null;
  editingScholarship: Scholarship | null = null;

  // Filters
  searchTerm = '';
  statusFilter = '';
  sortBy: SortOption = 'dateCreated';
  showExpiredOnly = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.loadScholarships();
    this.applyFilters();
  }

  private loadScholarships(): void {
    // Sample data - replace with actual API call
    this.scholarships = [
      {
        id: '1',
        title: 'Excellence Scholarship for Engineering Students',
        shortSummary:
          'Full funding opportunity for outstanding engineering students pursuing their masters degree',
        organizationName: 'Tech Foundation',
        country: 'United States',
        educationLevel: "Graduate / Master's",
        scholarshipType: 'Fully Funded',
        fieldsOfStudy: ['Engineering', 'Computer Science'],
        status: 'Approved',
        applicationDeadline: new Date('2025-12-15'),
        dateCreated: new Date('2025-01-15'),
        analytics: { views: 1250, bookmarks: 89, applications: 145 },
      },
      {
        id: '2',
        title: 'Women in STEM Leadership Grant',
        shortSummary:
          'Supporting female students in Science, Technology, Engineering, and Mathematics fields',
        organizationName: 'STEM Advancement Society',
        country: 'Canada',
        educationLevel: "Undergraduate / Bachelor's",
        scholarshipType: 'Partial Funding',
        fieldsOfStudy: ['Engineering', 'Computer Science', 'Mathematics'],
        status: 'Pending',
        applicationDeadline: new Date('2025-11-30'),
        dateCreated: new Date('2025-02-20'),
        analytics: { views: 890, bookmarks: 67, applications: 89 },
      },
      {
        id: '3',
        title: 'International Business Excellence Award',
        shortSummary:
          'Merit-based scholarship for international students in business administration',
        organizationName: 'Global Business Institute',
        country: 'United Kingdom',
        educationLevel: "Graduate / Master's",
        scholarshipType: 'Merit-based',
        fieldsOfStudy: ['Business Administration', 'Economics', 'Finance'],
        status: 'Approved',
        applicationDeadline: new Date('2025-10-30'),
        dateCreated: new Date('2025-03-10'),
        analytics: { views: 2100, bookmarks: 156, applications: 234 },
      },
      {
        id: '4',
        title: 'Medical Research Fellowship',
        shortSummary:
          'Research-focused fellowship for medical students interested in clinical research',
        organizationName: 'Medical Research Foundation',
        country: 'Australia',
        educationLevel: 'Doctorate / PhD',
        scholarshipType: 'Fellowship',
        fieldsOfStudy: ['Medicine', 'Public Health'],
        status: 'Expired',
        applicationDeadline: new Date('2024-08-15'),
        dateCreated: new Date('2024-05-20'),
        analytics: { views: 567, bookmarks: 34, applications: 45 },
      },
      {
        id: '5',
        title: 'Environmental Science Innovation Grant',
        shortSummary: 'Supporting innovative research in environmental science and sustainability',
        organizationName: 'Green Future Foundation',
        country: 'Germany',
        educationLevel: 'Doctorate / PhD',
        scholarshipType: 'Research Grant',
        fieldsOfStudy: ['Environmental Science', 'Biology'],
        status: 'Rejected',
        applicationDeadline: new Date('2025-09-20'),
        dateCreated: new Date('2025-01-08'),
        analytics: { views: 340, bookmarks: 12, applications: 8 },
      },
      {
        id: '6',
        title: 'African Students Excellence Program',
        shortSummary: 'Full scholarship program for African students pursuing higher education',
        organizationName: 'Education for Africa',
        country: 'Kenya',
        educationLevel: "Undergraduate / Bachelor's",
        scholarshipType: 'Fully Funded',
        fieldsOfStudy: ['Any Level'],
        status: 'Approved',
        applicationDeadline: new Date('2026-01-15'),
        dateCreated: new Date('2025-04-01'),
        analytics: { views: 3200, bookmarks: 245, applications: 456 },
      },
    ];
  }

  // Filtering and sorting methods
  applyFilters(): void {
    let filtered = [...this.scholarships];

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (scholarship) =>
          scholarship.title.toLowerCase().includes(searchLower) ||
          scholarship.shortSummary.toLowerCase().includes(searchLower) ||
          scholarship.organizationName.toLowerCase().includes(searchLower) ||
          scholarship.country.toLowerCase().includes(searchLower) ||
          scholarship.fieldsOfStudy.some((field) => field.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter((scholarship) => scholarship.status === this.statusFilter);
    }

    // Apply expired only filter
    if (this.showExpiredOnly) {
      filtered = filtered.filter((scholarship) => this.isExpired(scholarship.applicationDeadline));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'applications':
          return b.analytics.applications - a.analytics.applications;
        case 'views':
          return b.analytics.views - a.analytics.views;
        case 'dateCreated':
        default:
          return b.dateCreated.getTime() - a.dateCreated.getTime();
      }
    });

    this.filteredScholarships = filtered;
  }

  // Utility methods
  getTotalScholarships(): number {
    return this.scholarships.length;
  }

  getTotalApplications(): number {
    return this.scholarships.reduce(
      (total, scholarship) => total + scholarship.analytics.applications,
      0
    );
  }

  getScholarshipsByStatus(status: string): Scholarship[] {
    return this.scholarships.filter((scholarship) => scholarship.status === status);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  isExpired(deadline: Date): boolean {
    return new Date() > deadline;
  }

  isDeadlineSoon(deadline: Date): boolean {
    const now = new Date();
    const daysUntilDeadline = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDeadline <= 30 && daysUntilDeadline > 0;
  }

  getDeadlineText(deadline: Date): string {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return '1 day left';
    } else if (diffDays <= 7) {
      return `${diffDays} days left`;
    } else if (diffDays <= 30) {
      return `${diffDays} days left`;
    } else {
      return `${Math.ceil(diffDays / 30)} months left`;
    }
  }

  // View mode methods
  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  // Filter toggle methods
  toggleExpiredOnly(): void {
    this.showExpiredOnly = !this.showExpiredOnly;
    this.applyFilters();
  }

  // Selection methods
  toggleSelection(scholarshipId: string): void {
    const index = this.selectedScholarships.indexOf(scholarshipId);
    if (index > -1) {
      this.selectedScholarships.splice(index, 1);
    } else {
      this.selectedScholarships.push(scholarshipId);
    }
  }

  clearSelection(): void {
    this.selectedScholarships = [];
  }

  // Modal methods
  viewScholarship(scholarship: Scholarship): void {
    console.log('Viewing scholarship:', scholarship);
    // Implement navigation to scholarship detail view
    this.currentScholarship = scholarship;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.currentScholarship = null;
  }

  editScholarship(scholarship: Scholarship): void {
    if (scholarship.status === 'Rejected') {
      alert('Rejected scholarships cannot be edited. Please create a new scholarship instead.');
      return;
    }

    console.log('Editing scholarship:', scholarship);
    // Implement navigation to edit form with pre-filled data
    //create a deep copy for editing
    this.editingScholarship = {
      ...scholarship,
      fieldsOfStudy: [...scholarship.fieldsOfStudy],
      applicationDeadline: new Date(scholarship.applicationDeadline),
      dateCreated: new Date(scholarship.dateCreated),
      analytics: { ...scholarship.analytics },
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingScholarship = null;
  }

  saveEditedScholarship(): void {
    if (!this.editingScholarship) return;

    //validation
    if (!this.editingScholarship.title.trim()) {
      alert('Title is required');
      return;
    }
    if (!this.editingScholarship.shortSummary.trim()) {
      alert('Summary is required');
      return;
    }
    if (!this.editingScholarship.organizationName.trim()) {
      alert('Organization name is required');
      return;
    }

    //find and update the scholarship in the array
    const index = this.scholarships.findIndex((s) => s.id === this.editingScholarship!.id);
    if (index !== -1) {
      this.scholarships[index] = { ...this.editingScholarship };
      this.applyFilters();
      this.showNotification('Scholarship updated successfully', 'success');
    }
    this.closeEditModal();
  }

  //Helper method to formate date for input field
  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  //helper method to update deadline from input
  updateDeadline(dateString: string): void {
    if (this.editingScholarship) {
      this.editingScholarship.applicationDeadline = new Date(dateString);
    }
  }

  //action methods
  deleteScholarship(scholarship: Scholarship): void {
    const confirmMessage = `Are you sure you want to delete "${scholarship.title}"? This action cannot be undone.`;

    if (confirm(confirmMessage)) {
      console.log('Deleting scholarship:', scholarship);

      // Remove from local array (in real app, make API call)
      this.scholarships = this.scholarships.filter((s) => s.id !== scholarship.id);
      this.applyFilters();

      // Show success message
      this.showNotification('Scholarship deleted successfully', 'success');
    }
  }

  bulkDelete(): void {
    if (this.selectedScholarships.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${this.selectedScholarships.length} scholarship(s)? This action cannot be undone.`;

    if (confirm(confirmMessage)) {
      console.log('Bulk deleting scholarships:', this.selectedScholarships);

      // Remove selected scholarships (in real app, make API call)
      this.scholarships = this.scholarships.filter(
        (s) => !this.selectedScholarships.includes(s.id)
      );
      this.clearSelection();
      this.applyFilters();

      // Show success message
      this.showNotification('Scholarships deleted successfully', 'success');
    }
  }

  // Navigation methods
  navigateToPost(): void {
    this.router.navigate(['/provider/post']);
  }

  // Utility methods
  trackByScholarshipId(index: number, scholarship: Scholarship): string {
    return scholarship.id;
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // In a real app, you'd use a toast/notification service
    alert(message);
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
          `"${scholarship.title}"`,
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
