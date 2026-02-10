import { Component, Input } from '@angular/core';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { AdminService } from '../../../core/services/admin.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface AdminProvider {
  id: number;

  // Organization
  name: string;
  type: string;

  // Contact
  email: string;
  phone?: string;

  // Status & meta
  status: 'active' | 'pending' | 'suspended';
  registrationDate: string;

  // Stats
  postedScholarship: number;
  activeScholarships: number;

  // Optional UI fields
  website?: string;
  address?: string;
  contactPerson?: string;
  verificationDocs?: string[];
  description?: string;
  lastActive?: string;
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
  imports: [CommonModule, DashboardLayout, FormsModule, MatIconModule, ConfirmModal],
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
    { label: 'Logout', action: 'logout' },
  ];
  @Input() providerId!: number;

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService
  ) {}
  Math = Math;
  providers: AdminProvider[] = [];
  filteredProviders: AdminProvider[] = [];

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
  selectedProvider: AdminProvider | null = null;
  confirmAction: 'approve' | 'decline' | 'suspend' | 'activate' | 'delete' | null = null;
  confirmReason: string = '';

  // Activity logs
  activityLogs: ActivityLog[] = [];

  // Statistics
  stats = {
    totalProviders: 0,
    activeProviders: 0,
    pendingProviders: 0,
    suspendedProviders: 0,
  };
  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '—';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString();
  }

  ngOnInit(): void {
    this.loadProviders();
  }
  loadProviders() {
    this.adminService.getProviders().subscribe((res) => {
      this.providers = res.data.map((user: any) => this.mapProvider(user));
      this.updateStatistics();
      this.applyFilters();
      this.providers.forEach((provider) => {
        this.loadProviderScholarships(provider.id, provider);
      });
    });
  }

  mapProvider(user: any): AdminProvider {
    const profile = user.providerProfile;

    return {
      id: user.id,
      name: profile?.organization_name ?? '—',
      type: profile?.organization_type ?? 'unknown',

      email: profile?.contact_email ?? user.email,
      phone: profile?.phone,

      status: user.status,
      registrationDate: user.createdAt,

      postedScholarship: 0, // plug API later
      activeScholarships: 0,

      website: profile?.website,
      address: profile?.country,
      contactPerson: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      verificationDocs: this.parseVerificationDocs(profile?.verification_docs),
    };
  }

  parseVerificationDocs(docs: any): string[] {
    if (!docs) return [];

    // If already an array, return it
    if (Array.isArray(docs)) {
      return docs;
    }

    // If it's a string in PostgreSQL array format: {url1,url2}
    if (typeof docs === 'string') {
      const cleaned = docs.replace(/[{}]/g, '');
      if (cleaned.trim() === '') return [];
      return cleaned.split(',').map((url) => url.trim());
    }

    return [];
  }

  getFileName(url: string): string {
    try {
      let filename = decodeURIComponent(url.split('/').pop() || 'Document');

      // ✅ Remove double extensions (.pdf.pdf, .doc.doc, etc.)
      const doubleExtensions = [
        '.pdf.pdf',
        '.doc.doc',
        '.docx.docx',
        '.jpg.jpg',
        '.png.png',
        '.jpeg.jpeg',
      ];

      for (const ext of doubleExtensions) {
        if (filename.endsWith(ext)) {
          // Remove the duplicate part
          filename = filename.replace(ext, ext.slice(0, ext.length / 2));
        }
      }

      return filename;
    } catch (e) {
      return url.split('/').pop() || 'Document';
    }
  }

  getDownloadUrl(url: string): string {
    if (!url) return url;

    let cleanedUrl = url;

    // Remove double extensions
    cleanedUrl = cleanedUrl.replace('.pdf.pdf', '.pdf');
    cleanedUrl = cleanedUrl.replace('.doc.doc', '.doc');
    cleanedUrl = cleanedUrl.replace('.docx.docx', '.docx');

    // Use image/upload instead of raw/upload (more reliable)
    cleanedUrl = cleanedUrl.replace('/raw/upload/', '/image/upload/');

    // Add download flag
    if (!cleanedUrl.includes('fl_attachment')) {
      // Try to add after /upload/ and before version
      if (cleanedUrl.match(/\/upload\/v\d+\//)) {
        cleanedUrl = cleanedUrl.replace(/\/upload\//, '/upload/fl_attachment/');
      } else {
        cleanedUrl = cleanedUrl.replace('/upload/', '/upload/fl_attachment/');
      }
    }

    return cleanedUrl;
  }

  downloadDocumentSimple(url: string): void {
    if (!url) return;

    // Clean URL
    let downloadUrl = url
      .replace('.pdf.pdf', '.pdf')
      .replace('.doc.doc', '.doc')
      .replace('/raw/upload/', '/image/upload/');

    // Add download flag if missing
    if (!downloadUrl.includes('fl_attachment')) {
      downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    console.log('Opening:', downloadUrl);

    // Open in new tab - browser will download it
    window.open(downloadUrl, '_blank');
  }

  updateStatistics() {
    this.stats = {
      totalProviders: this.providers.length,
      activeProviders: this.providers.filter((p) => p.status === 'active').length,
      pendingProviders: this.providers.filter((p) => p.status === 'pending').length,
      suspendedProviders: this.providers.filter((p) => p.status === 'suspended').length,
    };
  }
  applyFilters(): void {
    const search = this.searchTerm.toLowerCase().trim();

    this.filteredProviders = this.providers.filter((provider) => {
      const matchesSearch =
        provider.email.toLowerCase().includes(search) ||
        provider.name.toLowerCase().includes(search) ||
        provider.type.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' || provider.status === this.selectedStatus;

      const matchesType = this.selectedType === 'all' || provider.type === this.selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });

    this.currentPage = 1;
  }

  getPaginatedProviders(): AdminProvider[] {
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

  viewProviderDetails(provider: AdminProvider): void {
    this.selectedProvider = provider;
    this.loadActivityLogs(provider.id);
    this.showDetailsModal = true;
    this.loadProviderScholarships(provider.id, provider);
  }

  loadProviderScholarships(providerId: number, provider: AdminProvider): void {
    this.adminService.getProviderScholarships(providerId).subscribe({
      next: (res: any) => {
        const scholarships = res.data || [];
        provider.postedScholarship = scholarships.length;
        provider.activeScholarships = scholarships.filter((s: any) => s.status === 'active').length;
      },
      error: (err) => {
        console.error('Failed to fetch provider scholarships', err);
        provider.postedScholarship = 0;
        provider.activeScholarships = 0;
      },
    });
  }

  providerTypes: string[] = [
    'NGO (Non-Governmental Organization)',
    'University/Educational Institution',
    'Private Company/Corporation',
    'Government Agency',
    'Foundation',
    'Religious Organization',
    'Community-Based Organization',
    'International Organization',
    'Research Institution',
    'Healthcare Organization',
    'Other',
  ];

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

  confirmApprove(provider: AdminProvider): void {
    this.selectedProvider = provider;
    this.confirmAction = 'approve';
    this.showConfirmModal = true;
  }

  confirmDecline(provider: AdminProvider): void {
    this.selectedProvider = provider;
    this.confirmAction = 'decline';
    this.showConfirmModal = true;
  }

  confirmSuspend(provider: AdminProvider | null): void {
    if (!provider) return;
    this.selectedProvider = provider;
    this.confirmAction = 'suspend';
    this.showConfirmModal = true;
  }

  confirmActivate(provider: AdminProvider | null) {
    if (!provider) return; // this handles null
    this.selectedProvider = provider;
    this.confirmAction = 'activate';
    this.showConfirmModal = true;
  }
  confirmDelete(provider: any) {
    this.selectedProvider = provider;
    this.confirmAction = 'delete'; // this now matches the type exactly
    this.showConfirmModal = true;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }
  executeConfirmAction(): void {
    if (!this.selectedProvider || !this.confirmAction) return;

    const id = this.selectedProvider.id;
    let request$;

    switch (this.confirmAction) {
      case 'approve':
        request$ = this.adminService.approveProvider(id);
        break;
      case 'decline':
        request$ = this.adminService.rejectProvider(id);
        break;
      case 'suspend':
        request$ = this.adminService.suspendProvider(id);
        break;
      case 'activate':
        request$ = this.adminService.activateProvider(id);
        break;
      case 'delete':
        request$ = this.adminService.deleteProvider(id);
        break;
      default:
        return;
    }

    request$.subscribe({
      next: () => {
        this.loadProviders(); // refresh provider list
      },
      error: (err) => console.error('Action failed', err),
      complete: () => this.closeConfirmModal(),
    });
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
  //added
  getTimeSinceActive(lastActive?: string | Date): string {
    if (!lastActive) return '—';

    const last = new Date(lastActive);
    const now = new Date();
    const diff = now.getTime() - last.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  downloadDocument(docName: string): void {
    console.log('Downloading:', docName);
    // Implement actual download logic
  }

  exportProviders(): void {
    const element = document.getElementById('providers-export');
    if (!element) {
      console.error('Providers export element not found');
      return;
    }

    html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('providers-management-report.pdf');
      })
      .catch((err) => {
        console.error('Providers PDF export failed', err);
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
