import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { AdminService } from '../../../core/services/admin.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NgZone } from '@angular/core';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;

  dateOfBirth?: Date;

  status: 'active' | 'pending' | 'suspended';
  registrationDate: Date;
  lastLogin: Date;
  avatar?: string;
  address: string;
  academic_level?: string;
  field_of_study?: string;
  country?: string;
  interest?: string;

  gpaMin?: number | null;
  gpaMax?: number | null;
  graduationYear: number;
  applicationsCount: number;
  acceptedScholarships: number;
}
interface Application {
  id: number;
  scholarshipTitle: string;
  provider: string;
  appliedDate: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'under_review';
  amount: number;
}

@Component({
  selector: 'app-student-management',
  standalone: true,
  imports: [CommonModule, DashboardLayout, FormsModule, MatIconModule, ConfirmModal],
  templateUrl: './student-management.html',
  styleUrls: ['./student-management.scss'],
})
export class StudentManagement {
  menu = [
    { label: 'Overview', route: '/admin' },
    { label: 'Providers', route: '/admin/providers' },
    { label: 'Students', route: '/admin/students' },
    { label: 'Scholarships', route: '/admin/scholarships' },
    { label: 'Reports', route: '/admin/reports' },
    { label: 'Logout', action: 'logout' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private zone: NgZone,
  ) {}

  students: Student[] = [];
  filteredStudents: Student[] = [];

  // Filter properties
  searchTerm: string = '';
  selectedStatus: string = 'all';
  // For the dropdown options
  fieldsOfStudy: string[] = [];

  // The selected value
  selectedField: string = 'all';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Modal states
  showDetailsModal: boolean = false;
  showConfirmModal: boolean = false;
  selectedStudent: Student | null = null;
  confirmAction: 'approve' | 'decline' | 'suspend' | 'activate' | null = null;
  confirmReason: string = '';

  // Applications
  studentApplications: Application[] = [];

  // Statistics
  stats = {
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  };

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.adminService.getAllStudents().subscribe({
      next: (res) => {
        const users = res.data;

        const mappedStudents = users.map((u: any) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone ?? null,
          status: u.status,
          registrationDate: new Date(u.createdAt),
          lastLogin: u.lastLogin ? new Date(u.lastLogin) : new Date(u.createdAt),
          address: u.address ?? '—',
          country: u.profile?.country ?? '—',
          academic_level: u.profile?.academic_level ?? '—',
          field_of_study: u.profile?.field_of_study ?? '—',
          applicationsCount: u.applications?.length ?? 0,
          acceptedScholarships:
            u.applications?.filter((a: any) => a.status === 'accepted').length ?? 0,
        }));

        // <-- Wrap the assignment and filter update in NgZone
        this.zone.run(() => {
          this.students = mappedStudents;
          this.fieldsOfStudy = Array.from(
            new Set(
              this.students
                .map((student) => student.field_of_study)
                .filter((f): f is string => f !== undefined),
            ),
          );
          this.updateStatistics();
          this.applyFilters();
        });
      },
      error: (err) => {
        console.error('Failed to load students', err);
      },
    });
  }

  updateStatistics(): void {
    this.stats.total = this.students.length;
    this.stats.active = this.students.filter((s) => s.status === 'active').length;
    this.stats.pending = this.students.filter((s) => s.status === 'pending').length;
    this.stats.suspended = this.students.filter((s) => s.status === 'suspended').length;
  }

  applyFilters(): void {
    this.filteredStudents = this.students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const search = this.searchTerm.toLowerCase();

      const matchesSearch =
        fullName.includes(search) || student.email.toLowerCase().includes(search);

      const matchesStatus = this.selectedStatus === 'all' || student.status === this.selectedStatus;

      const matchesField =
        this.selectedField === 'all' || student.field_of_study === this.selectedField;
      return matchesSearch && matchesStatus && matchesField;
    });

    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getPaginatedStudents(): Student[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredStudents.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredStudents.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  loadStudentProfile(studentId: number): void {
    this.adminService.getStudentProfile(studentId).subscribe({
      next: (res) => {
        if (!this.selectedStudent) return;

        const p = res.data;

        this.selectedStudent.academic_level = p.academic_level;
        this.selectedStudent.field_of_study = p.field_of_study;
        this.selectedStudent.country = p.country;
        this.selectedStudent.interest = p.interest;
        this.selectedStudent.dateOfBirth = p.date_of_birth ? new Date(p.date_of_birth) : undefined;
        this.selectedStudent.gpaMin = p.gpa_min;
        this.selectedStudent.gpaMax = p.gpa_max;
      },
      error: (err) => console.error('Failed to load student profile', err),
    });
  }

  viewStudentDetails(student: Student): void {
    this.selectedStudent = student;
    this.loadStudentProfile(student.id);
    this.loadStudentApplications(student.id);
    this.showDetailsModal = true;
  }

  loadStudentApplications(studentId: number): void {
    // Mock applications data
    this.studentApplications = [
      {
        id: 1,
        scholarshipTitle: 'Tech Excellence Award',
        provider: 'TechCorp Foundation',
        appliedDate: new Date('2025-09-15'),
        status: 'accepted',
        amount: 5000,
      },
      {
        id: 2,
        scholarshipTitle: 'Medical Students Grant',
        provider: 'Health Foundation',
        appliedDate: new Date('2025-09-20'),
        status: 'under_review',
        amount: 7500,
      },
      {
        id: 3,
        scholarshipTitle: 'Engineering Excellence',
        provider: 'Innovation Hub',
        appliedDate: new Date('2025-10-01'),
        status: 'pending',
        amount: 4000,
      },
      {
        id: 4,
        scholarshipTitle: 'Arts & Culture Award',
        provider: 'Cultural Society',
        appliedDate: new Date('2025-08-10'),
        status: 'rejected',
        amount: 3000,
      },
    ];
  }

  confirmDecline(student: Student): void {
    this.selectedStudent = student;
    this.confirmAction = 'decline';
    this.showConfirmModal = true;
  }

  confirmSuspend(student: Student | null) {
    if (!student) return;

    this.adminService.suspendStudent(student.id).subscribe({
      next: () => {
        student.status = 'suspended';
        this.updateStatistics();
        this.applyFilters();
      },
      error: (err) => console.error('Suspend failed', err),
    });
  }

  confirmActivate(student: Student | null) {
    if (!student) return;

    this.adminService.activateStudent(student.id).subscribe({
      next: () => {
        student.status = 'active';
        this.updateStatistics();
        this.applyFilters();
      },
      error: (err) => console.error('Activate failed', err),
    });
  }

  confirmApprove(student: Student | null) {
    if (!student) return;

    // Approve = Activate in your backend
    this.adminService.activateStudent(student.id).subscribe({
      next: () => {
        student.status = 'active';
        this.updateStatistics();
        this.applyFilters();
      },
      error: (err) => console.error('Approve failed', err),
    });
  }

  executeConfirmAction(): void {
    if (!this.selectedStudent || !this.confirmAction) return;

    const index = this.students.findIndex((s) => s.id === this.selectedStudent!.id);
    if (index === -1) return;

    switch (this.confirmAction) {
      case 'approve':
        this.students[index].status = 'active';
        break;
      case 'decline':
        this.adminService.deleteStudent(this.selectedStudent.id).subscribe({
          next: () => {
            this.students.splice(index, 1);
            this.updateStatistics();
            this.applyFilters();
          },
          error: (err) => console.error('Delete failed', err),
        });
        break;
        break;
      case 'suspend':
        this.students[index].status = 'suspended';
        break;
      case 'activate':
        this.students[index].status = 'active';
        break;
    }

    this.updateStatistics();
    this.applyFilters();
    this.closeConfirmModal();
  }

  openConfirmModal(action: 'approve' | 'decline' | 'suspend' | 'activate', student: Student) {
    this.selectedStudent = student;
    this.confirmAction = action;
    this.showConfirmModal = true;
    this.confirmReason = '';
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedStudent = null;
    this.studentApplications = [];
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.selectedStudent = null;
    this.confirmAction = null;
    this.confirmReason = '';
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getApplicationStatusClass(status: string): string {
    return `app-status-${status.replace('_', '-')}`;
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  calculateAge(dateOfBirth?: Date): number | null {
    if (!dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  getTimeSinceLogin(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  isExporting = false;

  exportStudents(): void {
    if (this.isExporting) return;
    this.isExporting = true;

    const element = document.getElementById('students-export');
    if (!element) {
      this.isExporting = false;
      console.error('Export element not found');
      return;
    }

    this.zone.runOutsideAngular(async () => {
      // wait for fonts (fixes Material icons warning)
      await document.fonts.ready;

      html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');

          const pdf = new jsPDF('p', 'mm', 'a4');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          const imgHeight = (canvas.height * pageWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          pdf.save('student-management-report.pdf');
        })
        .catch((err) => console.error('Export failed', err))
        .finally(() => {
          this.zone.run(() => (this.isExporting = false));
        });
    });
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
