import { Component } from '@angular/core';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
interface Provider {
  id: number;
  name: string;
  type: 'university' | 'ngo' | 'company';
  email: string;
  phone: string;
  website: string;
  status: 'active' | 'pending' | 'suspended';
  scholarshipsPosted: number;
  activeScholarships: number;
  registrationDate: Date;
  lastActive: Date;
  description: string;
  address: string;
  contactPerson: string;
  verificationDocs: string[];
}

interface ActivityLog {
  id: number;
  action: string;
  timestamp: Date;
  details: string;
}

@Component({
  selector: 'app-provider-management',
  standalone: true,
  imports: [CommonModule, DashboardLayout, FormsModule, MatIconModule],
  templateUrl: './provider-management.html',
  styleUrl: './provider-management.scss',
})
export class ProviderManagement {
  menu = [
    { label: 'Overview', route: '/admin' },
    { label: 'Providers', route: '/admin/providers' },
    { label: 'Students', route: '/admin/students' },
    { label: 'Scholarships', route: '/admin/scholarships' },
    { label: 'Reports', route: '/admin/reports' },
  ];
  Math = Math;
  providers: Provider[] = [];
  filteredProviders: Provider[] = [];

  // Filter properties
  searchTerm: string = '';
  selectedStatus: string = 'all';
  selectedType: string = 'all';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Modal states
  showDetailsModal: boolean = false;
  showConfirmModal: boolean = false;
  selectedProvider: Provider | null = null;
  confirmAction: 'approve' | 'decline' | 'suspend' | 'activate' | null = null;
  confirmReason: string = '';

  // Activity logs
  activityLogs: ActivityLog[] = [];

  // Statistics
  stats = {
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  };

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    // Mock data - replace with actual API call
    this.providers = [
      {
        id: 1,
        name: 'TechCorp Foundation',
        type: 'company',
        email: 'contact@techcorp.com',
        phone: '+1 234-567-8900',
        website: 'www.techcorp.com',
        status: 'active',
        scholarshipsPosted: 15,
        activeScholarships: 12,
        registrationDate: new Date('2024-01-15'),
        lastActive: new Date('2025-10-05'),
        description: 'Leading technology company supporting STEM education',
        address: '123 Tech Street, Silicon Valley, CA 94025',
        contactPerson: 'John Smith',
        verificationDocs: ['business_license.pdf', 'tax_certificate.pdf'],
      },
      {
        id: 2,
        name: 'Global Education Foundation',
        type: 'ngo',
        email: 'info@globaledu.org',
        phone: '+1 234-567-8901',
        website: 'www.globaledu.org',
        status: 'pending',
        scholarshipsPosted: 0,
        activeScholarships: 0,
        registrationDate: new Date('2025-10-01'),
        lastActive: new Date('2025-10-01'),
        description: 'NGO dedicated to providing educational opportunities worldwide',
        address: '456 Education Ave, New York, NY 10001',
        contactPerson: 'Sarah Johnson',
        verificationDocs: ['ngo_registration.pdf', 'board_resolution.pdf'],
      },
      {
        id: 3,
        name: 'State University',
        type: 'university',
        email: 'scholarships@stateuni.edu',
        phone: '+1 234-567-8902',
        website: 'www.stateuni.edu',
        status: 'active',
        scholarshipsPosted: 28,
        activeScholarships: 24,
        registrationDate: new Date('2023-09-10'),
        lastActive: new Date('2025-10-06'),
        description: 'Premier public university offering various scholarship programs',
        address: '789 University Blvd, Boston, MA 02115',
        contactPerson: 'Dr. Emily Chen',
        verificationDocs: ['accreditation.pdf', 'authorization_letter.pdf'],
      },
      {
        id: 4,
        name: 'Healthcare Scholars Inc.',
        type: 'company',
        email: 'support@healthscholars.com',
        phone: '+1 234-567-8903',
        website: 'www.healthscholars.com',
        status: 'suspended',
        scholarshipsPosted: 8,
        activeScholarships: 0,
        registrationDate: new Date('2024-06-20'),
        lastActive: new Date('2025-09-15'),
        description: 'Healthcare company supporting medical students',
        address: '321 Medical Center Dr, Chicago, IL 60611',
        contactPerson: 'Michael Brown',
        verificationDocs: ['incorporation_cert.pdf'],
      },
      {
        id: 5,
        name: 'Innovation Hub',
        type: 'company',
        email: 'hello@innovationhub.io',
        phone: '+1 234-567-8904',
        website: 'www.innovationhub.io',
        status: 'pending',
        scholarshipsPosted: 0,
        activeScholarships: 0,
        registrationDate: new Date('2025-10-04'),
        lastActive: new Date('2025-10-04'),
        description: 'Tech startup fostering innovation in education',
        address: '555 Startup Lane, Austin, TX 78701',
        contactPerson: 'Alex Martinez',
        verificationDocs: ['company_profile.pdf', 'founders_agreement.pdf'],
      },
      {
        id: 6,
        name: 'Arts & Culture Society',
        type: 'ngo',
        email: 'info@artsculture.org',
        phone: '+1 234-567-8905',
        website: 'www.artsculture.org',
        status: 'active',
        scholarshipsPosted: 10,
        activeScholarships: 8,
        registrationDate: new Date('2024-03-12'),
        lastActive: new Date('2025-10-03'),
        description: 'Supporting artists and creative professionals',
        address: '888 Arts Plaza, Los Angeles, CA 90012',
        contactPerson: 'Maria Garcia',
        verificationDocs: ['501c3_status.pdf', 'bylaws.pdf'],
      },
    ];

    this.updateStatistics();
    this.applyFilters();
  }

  updateStatistics(): void {
    this.stats.total = this.providers.length;
    this.stats.active = this.providers.filter((p) => p.status === 'active').length;
    this.stats.pending = this.providers.filter((p) => p.status === 'pending').length;
    this.stats.suspended = this.providers.filter((p) => p.status === 'suspended').length;
  }

  applyFilters(): void {
    this.filteredProviders = this.providers.filter((provider) => {
      const matchesSearch =
        provider.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        provider.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        provider.contactPerson.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus =
        this.selectedStatus === 'all' || provider.status === this.selectedStatus;
      const matchesType = this.selectedType === 'all' || provider.type === this.selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getPaginatedProviders(): Provider[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProviders.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredProviders.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  viewProviderDetails(provider: Provider): void {
    this.selectedProvider = provider;
    this.loadActivityLogs(provider.id);
    this.showDetailsModal = true;
  }

  loadActivityLogs(providerId: number): void {
    // Mock activity logs - replace with actual API call
    this.activityLogs = [
      {
        id: 1,
        action: 'Scholarship Posted',
        timestamp: new Date('2025-10-05T14:30:00'),
        details: 'Posted "Tech Excellence Award 2025"',
      },
      {
        id: 2,
        action: 'Profile Updated',
        timestamp: new Date('2025-10-03T10:15:00'),
        details: 'Updated contact information',
      },
      {
        id: 3,
        action: 'Scholarship Edited',
        timestamp: new Date('2025-10-01T16:45:00'),
        details: 'Modified deadline for "Engineering Grant"',
      },
      {
        id: 4,
        action: 'Login',
        timestamp: new Date('2025-09-28T09:20:00'),
        details: 'Logged in from IP: 192.168.1.1',
      },
      {
        id: 5,
        action: 'Scholarship Closed',
        timestamp: new Date('2025-09-25T12:00:00'),
        details: 'Closed "Summer Internship Program"',
      },
    ];
  }

  confirmApprove(provider: Provider): void {
    this.selectedProvider = provider;
    this.confirmAction = 'approve';
    this.showConfirmModal = true;
  }

  confirmDecline(provider: Provider): void {
    this.selectedProvider = provider;
    this.confirmAction = 'decline';
    this.showConfirmModal = true;
  }

  confirmSuspend(provider: Provider | null): void {
    if (!provider) return;
    this.selectedProvider = provider;
    this.confirmAction = 'suspend';
    this.showConfirmModal = true;
  }

  confirmActivate(provider: Provider | null) {
    if (!provider) return; // this handles null
    this.selectedProvider = provider;
    this.confirmAction = 'activate';
    this.showConfirmModal = true;
  }

  executeConfirmAction(): void {
    if (!this.selectedProvider || !this.confirmAction) return;

    const index = this.providers.findIndex((p) => p.id === this.selectedProvider!.id);
    if (index === -1) return;

    switch (this.confirmAction) {
      case 'approve':
        this.providers[index].status = 'active';
        break;
      case 'decline':
        this.providers.splice(index, 1);
        break;
      case 'suspend':
        this.providers[index].status = 'suspended';
        break;
      case 'activate':
        this.providers[index].status = 'active';
        break;
    }

    this.updateStatistics();
    this.applyFilters();
    this.closeConfirmModal();
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedProvider = null;
    this.activityLogs = [];
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.selectedProvider = null;
    this.confirmAction = null;
    this.confirmReason = '';
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'university':
        return 'school';
      case 'ngo':
        return 'handshake';
      case 'company':
        return 'apartment';
      default:
        return 'assignment';
    }
  }

  getStatIcon(index: number): string {
    switch (index) {
      case 1:
        return 'bar_chart';
      case 2:
        return 'call';
      case 3:
        return 'school';
      case 4:
        return 'description';
      case 5:
        return 'edit';
      default:
        return 'insert_chart';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getTimeSinceActive(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  downloadDocument(docName: string): void {
    console.log('Downloading:', docName);
    // Implement actual download logic
  }

  exportProviders(): void {
    console.log('Exporting providers to CSV');
    // Implement export logic
  }
}
