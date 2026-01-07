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

export interface Scholarship {
  id: number;
  title: string;
  description: string;
  provider: string;
  category: string;
  amount: number;
  deadline: Date;
  status: 'active' | 'expired' | 'pending';
  createdDate: Date;
  eligibility: string;
  requirements: string[];
  applicationUrl?: string;
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
  ],
})
export class ScholarshipManagement implements OnInit {
  menu = [
    { label: 'Overview', route: '/admin' },
    { label: 'Providers', route: '/admin/providers' },
    { label: 'Students', route: '/admin/students' },
    { label: 'Scholarships', route: '/admin/scholarships' },
    { label: 'Reports', route: '/admin/reports' },
  ];

  scholarships: Scholarship[] = [];
  filteredScholarships: Scholarship[] = [];
  selectedScholarship: Scholarship | null = null;

  // Forms
  filterForm: FormGroup;
  editForm: FormGroup;

  // UI state
  isEditModalOpen = false;
  isDeleteModalOpen = false;
  isViewModalOpen = false;

  // Filter options
  providers: string[] = [];
  categories: string[] = [];
  statusOptions = ['all', 'active', 'expired', 'pending'];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(private fb: FormBuilder) {
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
      amount: [0, [Validators.required, Validators.min(1)]],
      deadline: ['', Validators.required],
      eligibility: ['', Validators.required],
      requirements: [''],
      applicationUrl: [''],
    });
  }

  ngOnInit(): void {
    this.loadScholarships();
    this.setupFilterSubscription();
  }
  loadScholarships(): void {
    this.scholarships = [
      {
        id: 1,
        title: 'Merit Excellence Scholarship',
        description: 'For outstanding academic performance',
        provider: 'University Foundation',
        category: 'Academic Excellence',
        amount: 5000,
        deadline: new Date('2024-12-31'),
        status: 'active',
        createdDate: new Date('2024-01-15'),
        eligibility: 'GPA 3.5 or higher',
        requirements: ['Transcript', 'Essay', 'Recommendation letters'],
        applicationUrl: 'https://example.com/apply/1',
      },
      {
        id: 2,
        title: 'STEM Innovation Grant',
        description: 'Supporting future scientists and engineers',
        provider: 'Tech Corp Foundation',
        category: 'STEM',
        amount: 7500,
        deadline: new Date('2024-11-15'),
        status: 'pending',
        createdDate: new Date('2024-02-01'),
        eligibility: 'STEM major with research experience',
        requirements: ['Portfolio', 'Research proposal', 'Academic records'],
      },
      {
        id: 3,
        title: 'Community Service Award',
        description: 'Recognizing community engagement',
        provider: 'Local Community Trust',
        category: 'Community Service',
        amount: 3000,
        deadline: new Date('2024-01-30'),
        status: 'expired',
        createdDate: new Date('2023-11-01'),
        eligibility: '100+ community service hours',
        requirements: ['Service log', 'Supervisor references'],
      },
      {
        id: 4,
        title: 'Arts & Culture Scholarship',
        description: 'Supporting creative talents',
        provider: 'Arts Council',
        category: 'Arts',
        amount: 4000,
        deadline: new Date('2025-03-15'),
        status: 'active',
        createdDate: new Date('2024-01-20'),
        eligibility: 'Arts major with portfolio',
        requirements: ['Portfolio submission', 'Artist statement'],
      },
    ];

    this.extractFilterOptions();
    this.applyFilters();
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
    scholarship.status = 'active';
    // API call would go here
    console.log('Approved scholarship:', scholarship.id);
  }

  declineScholarship(scholarship: Scholarship): void {
    scholarship.status = 'expired';
    // API call would go here
    console.log('Declined scholarship:', scholarship.id);
  }

  openEditModal(scholarship: Scholarship): void {
    this.selectedScholarship = scholarship;
    this.editForm.patchValue({
      title: scholarship.title,
      description: scholarship.description,
      provider: scholarship.provider,
      category: scholarship.category,
      amount: scholarship.amount,
      deadline: this.formatDateForInput(scholarship.deadline),
      eligibility: scholarship.eligibility,
      requirements: scholarship.requirements.join(', '),
      applicationUrl: scholarship.applicationUrl || '',
    });
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedScholarship = null;
    this.editForm.reset();
  }

  saveScholarship(): void {
    if (this.editForm.valid && this.selectedScholarship) {
      const formValue = this.editForm.value;

      this.selectedScholarship.title = formValue.title;
      this.selectedScholarship.description = formValue.description;
      this.selectedScholarship.provider = formValue.provider;
      this.selectedScholarship.category = formValue.category;
      this.selectedScholarship.amount = formValue.amount;
      this.selectedScholarship.deadline = new Date(formValue.deadline);
      this.selectedScholarship.eligibility = formValue.eligibility;
      this.selectedScholarship.requirements = formValue.requirements
        .split(',')
        .map((r: string) => r.trim());
      this.selectedScholarship.applicationUrl = formValue.applicationUrl;

      // API call would go here
      console.log('Updated scholarship:', this.selectedScholarship);

      this.closeEditModal();
      this.extractFilterOptions();
      this.applyFilters();
    }
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
    if (this.selectedScholarship) {
      const index = this.scholarships.findIndex((s) => s.id === this.selectedScholarship!.id);
      if (index > -1) {
        this.scholarships.splice(index, 1);
        // API call would go here
        console.log('Deleted scholarship:', this.selectedScholarship.id);
      }
      this.closeDeleteModal();
      this.extractFilterOptions();
      this.applyFilters();
    }
  }

  openViewModal(scholarship: Scholarship): void {
    this.selectedScholarship = scholarship;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedScholarship = null;
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
}
