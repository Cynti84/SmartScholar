import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { TitleCasePipe, CommonModule } from '@angular/common';
import { FilterPipe } from './filter.pipe';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service';

export interface Scholarship {
  id: number;
  title: string;
  description: string;
  provider: string;
  shortSummary: string;
  category: string;
  fieldOfStudy: string[];
  country: string;
  scholarshipType: string;
  deadline: Date;
  status: 'pending' | 'approved' | 'rejected';
  createdDate: Date;
  eligibility: string;
  requirements: string;
  applicationUrl?: string;
  email: string;
  logoUrl?: string;
  benefits?: string;
  adminNotes?: string;
  verificationDocs?: {
    name: string;
    url: string;
  }[];
}

export interface FilterCriteria {
  provider: string;
  category: string;
  status: string;
  searchTerm: string;
}

@Component({
  selector: 'app-scholarship-management',
  standalone: true,
  templateUrl: './scholarship-management.html',
  styleUrls: ['./scholarship-management.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TitleCasePipe,
    FilterPipe,
    DashboardLayout,
    ConfirmModal,
  ],
})
export class ScholarshipManagement implements OnInit {
  menu = [
    { label: 'Overview', route: '/admin' },
    { label: 'Providers', route: '/admin/providers' },
    { label: 'Students', route: '/admin/students' },
    { label: 'Scholarships', route: '/admin/scholarships' },
    { label: 'Reports', route: '/admin/reports' },
    { label: 'Logout', action: 'logout' },
  ];

  scholarships: Scholarship[] = [];
  filteredScholarships: Scholarship[] = [];
  selectedScholarship: Scholarship | null = null;

  // Forms
  editForm!: FormGroup;
  filterForm!: FormGroup;
  // UI state
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isViewModalOpen = false;

  // Filter options
  providers: string[] = [];
  categories: string[] = [];
  statusOptions = ['all', 'approved', 'expired', 'pending'];

  stats = {
    totalScholarships: 0,
    activeScholarships: 0,
    pendingScholarships: 0,
    expiredScholarships: 0,
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService
  ) {
    this.filterForm = this.fb.group({
      provider: [''],
      category: [''],
      status: ['all'],
      searchTerm: [''],
    });

    this.editForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      provider: ['', Validators.required],
      category: ['', Validators.required],
      scholarship_type: ['', Validators.required],
      deadline: ['', Validators.required],
      eligibility: ['', Validators.required],
      requirements: [''],
      applicationUrl: [''],
    });
  }

  ngOnInit(): void {
    this.loadScholarships();
    this.setupFilterSubscription();
    this.loadPendingScholarships();
  }
  loadScholarships(): void {
    this.adminService.getAllScholarships().subscribe({
      next: (res) => {
        this.scholarships = res.data.map((s: any) => ({
          id: s.scholarship_id,
          title: s.title,
          description: s.description,
          shortSummary: s.short_summary,
          provider:
            s.organization_name || s.provider?.providerProfile?.organization_name || 'Unknown',
          country: s.country,
          fieldOfStudy: s.fields_of_study || [],
          scholarshipType: s.scholarship_type,
          deadline: new Date(s.deadline),
          createdDate: new Date(s.created_at),
          eligibility: s.eligibility_criteria || '', // ✅ include eligibility
          requirements: s.application_instructions || '', // ✅ include requirements
          applicationUrl: s.application_link,
          email: s.contact_email,
          logoUrl: s.flyer_url || s.banner_url || null, // ✅ include logo
          benefits: s.benefits || '', // ✅ include benefits
          verificationDocs: (s.verification_docs || []).map((doc: string) => ({
            name: doc.split('/').pop(),
            url: doc,
          })),
          adminNotes: s.admin_notes,
          status: this.mapStatus(s.status),
        }));

        this.extractFilterOptions();
        this.applyFilters();
        this.calculateScholarshipStats();
      },
      error: (err) => {
        console.error('Failed to load scholarships', err);
      },
    });
  }

  mapStatus(status: string): 'pending' | 'approved' | 'rejected' {
    if (status === 'approved') return 'approved';
    if (status === 'rejected') return 'rejected';
    return 'pending';
  }

  calculateScholarshipStats(): void {
    this.stats.totalScholarships = this.scholarships.length;

    this.stats.pendingScholarships = this.scholarships.filter((s) => s.status === 'pending').length;

    this.stats.activeScholarships = this.scholarships.filter((s) => s.status === 'approved').length;
  }

  extractFilterOptions(): void {
    this.providers = [...new Set(this.scholarships.map((s) => s.provider))];
    this.categories = [...new Set(this.scholarships.map((s) => s.category))];
  }

  setupFilterSubscription(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;

    this.filteredScholarships = this.scholarships.filter((scholarship) => {
      const matchesProvider = !filters.provider || scholarship.provider === filters.provider;
      const matchesCategory = !filters.category || scholarship.category === filters.category;
      const matchesStatus = filters.status === 'all' || scholarship.status === filters.status;
      const matchesSearch =
        !filters.searchTerm ||
        scholarship.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        scholarship.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        scholarship.provider.toLowerCase().includes(filters.searchTerm.toLowerCase());

      return matchesProvider && matchesCategory && matchesStatus && matchesSearch;
    });

    this.totalItems = this.filteredScholarships.length;
    this.currentPage = 1;
  }

  // Pagination methods
  get paginatedScholarships(): Scholarship[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredScholarships.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // CRUD Operations
  approveScholarship(scholarship: Scholarship): void {
    this.adminService.approveScholarship(scholarship.id).subscribe({
      next: () => {
        scholarship.status = 'approved';
        this.calculateScholarshipStats(); // ✅
      },
      error: (err) => console.error(err),
    });
  }

  declineScholarship(scholarship: Scholarship): void {
    this.adminService.rejectScholarship(scholarship.id).subscribe({
      next: () => {
        scholarship.status = 'rejected';
        this.calculateScholarshipStats(); // ✅
      },
      error: (err) => console.error(err),
    });
  }

  loadPendingScholarships(): void {
    this.adminService.getPendingScholarships().subscribe({
      next: (res) => {
        // Assuming your API returns an array of scholarships
        this.stats.pendingScholarships = res.data.length;
      },
      error: (err) => console.error('Failed to fetch pending scholarships', err),
    });
  }

  openEditModal(scholarship: Scholarship): void {
    this.selectedScholarship = scholarship;
    this.editForm.patchValue({
      title: scholarship.title,
      description: scholarship.description,
      provider: scholarship.provider,
      benefits: scholarship.benefits,
      country: scholarship.category,
      scholarship_type: scholarship.scholarshipType,
      deadline: this.formatDateForInput(scholarship.deadline),
      eligibility: scholarship.eligibility,
      requirements: scholarship.requirements,
      applicationUrl: scholarship.applicationUrl || '',
      adminNotes: scholarship.adminNotes,
    });
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedScholarship = null;
    this.editForm.reset();
  }

  saveScholarship(): void {
    console.log('SAVE CLICKED');

    if (!this.editForm.valid) {
      console.log('FORM INVALID', this.editForm.errors);
      return;
    }

    if (!this.selectedScholarship) {
      console.log('NO SELECTED SCHOLARSHIP');
      return;
    }

    const payload = {
      ...this.editForm.value,
      deadline: new Date(this.editForm.value.deadline),
      application_instructions: this.editForm.value.requirements,
    };

    this.adminService.updateScholarship(this.selectedScholarship.id, payload).subscribe({
      next: (res) => {
        console.log('UPDATE SUCCESS', res);
        Object.assign(this.selectedScholarship!, payload);
        this.closeEditModal();
        this.applyFilters();
      },
      error: (err) => {
        console.error('UPDATE FAILED', err);
      },
    });
  }

  openDeleteModal(scholarship: Scholarship): void {
    this.selectedScholarship = scholarship;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedScholarship = null;
  }

  confirmDelete(): void {
    if (!this.selectedScholarship) return;

    this.adminService.deleteScholarship(this.selectedScholarship.id).subscribe({
      next: () => {
        this.scholarships = this.scholarships.filter((s) => s.id !== this.selectedScholarship!.id);
        this.closeDeleteModal();
        this.applyFilters();
      },
      error: (err) => console.error(err),
    });
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedScholarship = null;
  }
  // added
  viewScholarship(scholarship: Scholarship) {
    this.selectedScholarship = scholarship; // set the scholarship to view
    this.isViewModalOpen = true; // open the modal
  }
  // Utility methods
  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  clearFilters(): void {
    this.filterForm.reset({
      provider: '',
      category: '',
      status: 'all',
      searchTerm: '',
    });
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
