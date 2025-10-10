import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { FormsModule } from '@angular/forms';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  status: 'active' | 'pending' | 'suspended';
  registrationDate: Date;
  lastLogin: Date;
  avatar?: string;
  address: string;
  university: string;
  major: string;
  gpa: number;
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
  imports: [CommonModule, DashboardLayout, FormsModule],
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
  ];
  students: Student[] = [];
  filteredStudents: Student[] = [];

  // Filter properties
  searchTerm: string = '';
  selectedStatus: string = 'all';
  selectedUniversity: string = 'all';

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

  universities: string[] = [];

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    // Mock data - replace with actual API call
    this.students = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1 234-567-8900',
        dateOfBirth: new Date('2000-05-15'),
        status: 'active',
        registrationDate: new Date('2024-09-01'),
        lastLogin: new Date('2025-10-09'),
        address: '123 Main St, Boston, MA 02115',
        university: 'State University',
        major: 'Computer Science',
        gpa: 3.8,
        graduationYear: 2026,
        applicationsCount: 12,
        acceptedScholarships: 2,
      },
      {
        id: 2,
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@email.com',
        phone: '+1 234-567-8901',
        dateOfBirth: new Date('2001-08-22'),
        status: 'pending',
        registrationDate: new Date('2025-10-05'),
        lastLogin: new Date('2025-10-05'),
        address: '456 College Ave, Cambridge, MA 02138',
        university: 'Tech Institute',
        major: 'Engineering',
        gpa: 3.9,
        graduationYear: 2027,
        applicationsCount: 0,
        acceptedScholarships: 0,
      },
      {
        id: 3,
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'mbrown@email.com',
        phone: '+1 234-567-8902',
        dateOfBirth: new Date('1999-12-10'),
        status: 'active',
        registrationDate: new Date('2024-01-15'),
        lastLogin: new Date('2025-10-10'),
        address: '789 University Blvd, New York, NY 10001',
        university: 'Business School',
        major: 'Business Administration',
        gpa: 3.6,
        graduationYear: 2025,
        applicationsCount: 18,
        acceptedScholarships: 4,
      },
      {
        id: 4,
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@email.com',
        phone: '+1 234-567-8903',
        dateOfBirth: new Date('2002-03-18'),
        status: 'suspended',
        registrationDate: new Date('2024-06-10'),
        lastLogin: new Date('2025-09-20'),
        address: '321 Student Dr, Chicago, IL 60611',
        university: 'Medical College',
        major: 'Pre-Medicine',
        gpa: 3.7,
        graduationYear: 2028,
        applicationsCount: 8,
        acceptedScholarships: 1,
      },
      {
        id: 5,
        firstName: 'David',
        lastName: 'Wilson',
        email: 'dwilson@email.com',
        phone: '+1 234-567-8904',
        dateOfBirth: new Date('2000-11-25'),
        status: 'active',
        registrationDate: new Date('2024-03-20'),
        lastLogin: new Date('2025-10-08'),
        address: '555 Campus Way, Los Angeles, CA 90012',
        university: 'Arts Academy',
        major: 'Fine Arts',
        gpa: 3.5,
        graduationYear: 2026,
        applicationsCount: 15,
        acceptedScholarships: 3,
      },
      {
        id: 6,
        firstName: 'Jessica',
        lastName: 'Martinez',
        email: 'jmartinez@email.com',
        phone: '+1 234-567-8905',
        dateOfBirth: new Date('2001-07-08'),
        status: 'pending',
        registrationDate: new Date('2025-10-08'),
        lastLogin: new Date('2025-10-08'),
        address: '888 Education Ln, Austin, TX 78701',
        university: 'State University',
        major: 'Psychology',
        gpa: 3.85,
        graduationYear: 2027,
        applicationsCount: 0,
        acceptedScholarships: 0,
      },
    ];

    this.universities = [...new Set(this.students.map((s) => s.university))];
    this.updateStatistics();
    this.applyFilters();
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
      const matchesSearch =
        fullName.includes(this.searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.university.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus === 'all' || student.status === this.selectedStatus;
      const matchesUniversity =
        this.selectedUniversity === 'all' || student.university === this.selectedUniversity;

      return matchesSearch && matchesStatus && matchesUniversity;
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

  viewStudentDetails(student: Student): void {
    this.selectedStudent = student;
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
    console.log(`Suspending student: ${student.firstName} ${student.lastName}`);
    // Example service call
    // this.studentService.suspend(student.id).subscribe(...)
  }

  confirmActivate(student: Student | null) {
    if (!student) return;
    console.log(`Activating student: ${student.firstName} ${student.lastName}`);
    // this.studentService.activate(student.id).subscribe(...)
  }

  confirmApprove(student: Student | null) {
    if (!student) return;
    console.log(`Approving student: ${student.firstName} ${student.lastName}`);
    // this.studentService.approve(student.id).subscribe(...)
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
        this.students.splice(index, 1);
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

  calculateAge(dateOfBirth: Date): number {
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

  exportStudents(): void {
    console.log('Exporting students to CSV');
    // Implement export logic
  }

  Math = Math;
}
