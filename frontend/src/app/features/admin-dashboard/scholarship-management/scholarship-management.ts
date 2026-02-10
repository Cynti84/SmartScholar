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
import {
  FraudDetectionService,
  FraudAnalysis,
  RedFlag,
} from '../../../core/services/fraud-detection.service';

export interface Scholarship {
  id: number;
  title: string;
  organization_name?: string;

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
  country: string[] = [];
  statusOptions = ['all', 'approved', 'pending', 'rejected'];

  // Fraud detection state
  fraudAnalyses = new Map<number, FraudAnalysis>();
  loadingFraudAnalysis = new Map<number, boolean>();
  showFraudAnalysis = false;
  currentFraudAnalysis: FraudAnalysis | null = null;

  // Batch analysis
  batchAnalyzing = false;
  batchAnalysisResults: any = null;

  countries = [
    'Algeria',
    'Australia',
    'Austria',
    'Belgium',
    'Botswana',
    'Bulgaria',
    'Cameroon',
    'Canada',
    'Croatia',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Egypt',
    'Estonia',
    'Ethiopia',
    'Finland',
    'France',
    'Germany',
    'Ghana',
    'Hungary',
    'Ireland',
    'Italy',
    'Japan',
    'Kenya',
    'Latvia',
    'Lithuania',
    'Malawi',
    'Malta',
    'Morocco',
    'Netherlands',
    'New Zealand',
    'Nigeria',
    'Norway',
    'Poland',
    'Portugal',
    'Romania',
    'Rwanda',
    'Senegal',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'South Africa',
    'South Korea',
    'Spain',
    'Sweden',
    'Switzerland',
    'Tanzania',
    'Tunisia',
    'Uganda',
    'United Kingdom',
    'United States',
    'Zambia',
    'Zimbabwe',
  ];

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
    private adminService: AdminService,
    private fraudDetection: FraudDetectionService
  ) {
    this.filterForm = this.fb.group({
      provider: [''],
      country: [''],
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
    setTimeout(() => {
      this.loadVisibleFraudAnalyses();
    }, 1000);
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
          organization_name: s.organization_name, // ✅ ADD THIS LINE TO MAP THE FIELD

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
    this.country = [...new Set(this.scholarships.map((s) => s.category))];
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
      const matchesCountry = !filters.country || scholarship.country === filters.country;
      const matchesStatus = filters.status === 'all' || scholarship.status === filters.status;
      const matchesSearch =
        !filters.searchTerm ||
        scholarship.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        scholarship.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        scholarship.provider.toLowerCase().includes(filters.searchTerm.toLowerCase());

      return matchesProvider && matchesCountry && matchesStatus && matchesSearch;
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
      // Load fraud analyses for newly visible scholarships
      setTimeout(() => {
        this.loadVisibleFraudAnalyses();
      }, 100);
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
    this.selectedScholarship = scholarship;
    this.isViewModalOpen = true;

    // Load fraud analysis for this scholarship
    if (!this.fraudAnalyses.has(scholarship.id)) {
      this.loadFraudAnalysis(scholarship.id);
    }
    this.currentFraudAnalysis = this.fraudAnalyses.get(scholarship.id) || null;
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

  // Get fraud analysis for scholarship (with caching)
  getFraudAnalysis(scholarshipId: number): FraudAnalysis | null {
    return this.fraudAnalyses.get(scholarshipId) || null;
  }

  // load fraud analysis for a scholarship
  loadFraudAnalysis(scholarshipId: number, forceRefresh = false): void {
    if (this.loadingFraudAnalysis.get(scholarshipId)) {
      return; //already loading
    }

    this.loadingFraudAnalysis.set(scholarshipId, true);
    this.fraudDetection.analyzeScholarship(scholarshipId, forceRefresh).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.fraudAnalyses.set(scholarshipId, response.data);
        }
        this.loadingFraudAnalysis.set(scholarshipId, false);
      },
      error: (err) => {
        console.error('Fraud analysis error:', err);
        this.loadingFraudAnalysis.set(scholarshipId, false);
      },
    });
  }

  // check if fraud analysis is loading
  isFraudAnalysisLoading(scholarshipId: number): boolean {
    return this.loadingFraudAnalysis.get(scholarshipId) || false;
  }

  // get risk badge class for UI
  getRiskBadgeClass(riskLevel: 'low' | 'medium' | 'high'): string {
    return this.fraudDetection.getRiskBadgeClass(riskLevel);
  }

  // get risk icon
  getRiskIcon(riskLevel: 'low' | 'medium' | 'high'): string {
    return this.fraudDetection.getRiskIcon(riskLevel);
  }

  // get severity class for red flags
  getSeverityClass(severity: 'low' | 'medium' | 'high'): string {
    return this.fraudDetection.getSeverityClass(severity);
  }

  // toggle fraud analysis visibility in modal
  toggleFraudAnalysis(): void {
    this.showFraudAnalysis = !this.showFraudAnalysis;

    if (this.showFraudAnalysis && this.selectedScholarship) {
      // Load analysis if not already loaded
      if (!this.fraudAnalyses.has(this.selectedScholarship.id)) {
        this.loadFraudAnalysis(this.selectedScholarship.id);
      }
      this.currentFraudAnalysis = this.fraudAnalyses.get(this.selectedScholarship.id) || null;
    }
  }

  // refresh fraud analyses
  refreshFraudAnalysis(): void {
    if (this.selectedScholarship) {
      this.loadFraudAnalysis(this.selectedScholarship.id, true);
      setTimeout(() => {
        this.currentFraudAnalysis = this.fraudAnalyses.get(this.selectedScholarship!.id) || null;
      }, 100);
    }
  }

  // batch analyze all pending scholarships
  batchAnalyzePending(): void {
    const pendingIds = this.scholarships.filter((s) => s.status === 'pending').map((s) => s.id);

    if (pendingIds.length === 0) {
      alert('No pending scholarships to analyze');
      return;
    }

    this.batchAnalyzing = true;

    this.fraudDetection.batchAnalyze(pendingIds).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Cache all results
          response.data.results.forEach((analysis) => {
            this.fraudAnalyses.set(analysis.scholarshipId, analysis);
          });

          this.batchAnalysisResults = response.data;
          this.batchAnalyzing = false;

          alert(
            `Analyzed ${response.data.summary.total} scholarships:\n` +
              `Low Risk: ${response.data.summary.lowRisk}\n` +
              `Medium Risk: ${response.data.summary.mediumRisk}\n` +
              `High Risk: ${response.data.summary.highRisk}`
          );
        }
      },
      error: (err) => {
        console.error('Batch analysis error:', err);
        this.batchAnalyzing = false;
        alert('Failed to perform batch analysis');
      },
    });
  }

  // load fraud analyses for visible scholarships (on page load)
  loadVisibleFraudAnalyses(): void {
    // Auto-load fraud analysis for pending scholarships
    const pendingScholarships = this.paginatedScholarships
      .filter((s) => s.status === 'pending')
      .slice(0, 5); // Limit to first 5 to avoid too many API calls

    pendingScholarships.forEach((scholarship) => {
      if (!this.fraudAnalyses.has(scholarship.id)) {
        this.loadFraudAnalysis(scholarship.id);
      }
    });
  }

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
