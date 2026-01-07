import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

export interface UserProfile {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  address: string;

  // Student Specific
  university?: string;
  major?: string;
  gpa?: number;
  graduationYear?: number;
  studentId?: string;

  // Account Info
  role: 'student' | 'provider' | 'admin';
  accountCreated: Date;
  lastLogin: Date;
  profileImage?: string;
}

export interface EmailPreferences {
  scholarshipAlerts: boolean;
  applicationUpdates: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
  newScholarships: boolean;
  deadlineReminders: boolean;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    DashboardLayout,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    ConfirmModal,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  menu = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
    { label: 'Logout', action: 'logout' },
  ];
  isEditingProfile = false;
  isSaving = false;
  isDeleting = false;

  profileErrors: string[] = [];

  profileCompletion = 60;

  constructor(private router: Router, private authService: AuthService) {}

  get address() {
    return this.userProfile.address;
  }

  get education() {
    return this.userProfile.education;
  }

  constructor(private userService: UserService, private router: Router) {}
  // =========================
  // TAB NAVIGATION
  // =========================
  activeTab: 'profile' | 'security' | 'preferences' | 'account' = 'profile';

  switchTab(tab: 'profile' | 'security' | 'preferences' | 'account'): void {
    this.activeTab = tab;
  }

  // =========================
  // LOAD PROFILE
  // =========================
  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
      },
      error: (err) => {
        if (err.status !== 404) {
          alert('Failed to load profile');
        }
      },
    });
  }

  // =========================
  // SAVE / UPDATE PROFILE
  // =========================
  saveProfile(): void {
    this.profileErrors = [];

    if (!this.userProfile.firstName || !this.userProfile.lastName) {
      this.profileErrors.push('First and last name are required');
      return;
    }

    this.isSaving = true;

    const payload = this.mapFrontendToBackend(this.userProfile);

    this.userService.updateProfile(payload).subscribe({
      next: () => {
        alert('Profile updated successfully');
        this.isEditingProfile = false;
      },
      error: (err) => {
        this.profileErrors.push(err.error?.message || 'Failed to update profile');
      },
      complete: () => {
        this.isSaving = false;
      },
    });
  }

  // =========================
  // CREATE PROFILE (FIRST TIME)
  // =========================
  createProfile(): void {
    this.isSaving = true;

    const payload = this.mapFrontendToBackend(this.userProfile);

    this.userService.createProfile(payload).subscribe({
      next: () => {
        alert('Profile created successfully');
      },
      error: (err) => {
        this.profileErrors.push(err.error?.message || 'Failed to create profile');
      },
      complete: () => {
        this.isSaving = false;
      },
    });
  }

  // =========================
  // DELETE PROFILE
  // =========================
  deleteAccount(): void {
    if (!confirm('Delete your profile permanently?')) return;

    this.isDeleting = true;

    this.userService.deleteProfile().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      error: () => alert('Failed to delete profile'),
      complete: () => (this.isDeleting = false),
    });
  }

  // =========================
  // DOWNLOAD PROFILE
  // =========================
  downloadProfile(): void {
    this.userService.downloadProfile().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student-profile.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Failed to download profile'),
    });
  }

  // =========================
  // FRONTEND → BACKEND MAPPING
  // =========================
  private mapFrontendToBackend(profile: UserProfile): any {
    return {
      date_of_birth: profile.dateOfBirth,
      gender: profile.gender,
      country: profile.address?.country,
      academic_level: profile.education?.level,
      field_of_study: profile.education?.fieldOfStudy,
      financial_need: profile.education?.gpa,
      profile_image_url: profile.avatar,
    };
  }

  // =========================
  // HELPERS (USED BY HTML)
  // =========================
  getInitials(): string {
    if (!this.userProfile?.firstName || !this.userProfile?.lastName) return '';
    return (
      this.userProfile.firstName.charAt(0) + this.userProfile.lastName.charAt(0)
    ).toUpperCase();
  }

  // =========================
  // EDIT MODE
  // =========================
  enableEditMode(): void {
    this.isEditingProfile = true;
  }

  cancelEdit(): void {
    this.isEditingProfile = false;
    this.loadProfile(); // reset changes
  }

  // =========================
  // PROFILE IMAGE
  // =========================
  imagePreview: string | null = null;

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.userProfile.avatar = this.imagePreview;
    };
    reader.readAsDataURL(file);
  }

  removeProfileImage(): void {
    this.imagePreview = null;
    this.userProfile.avatar = '';
  }

  // =========================
  // PASSWORD MANAGEMENT
  // =========================
  isChangingPassword = false;

  passwordErrors: string[] = [];

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  enablePasswordChange(): void {
    this.isChangingPassword = true;
  }

  cancelPasswordChange(): void {
    this.isChangingPassword = false;
    this.passwordErrors = [];
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }

  getPasswordStrength(): 'weak' | 'medium' | 'strong' {
    const password = this.passwordData.newPassword;

    if (!password || password.length < 8) return 'weak';

    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

    return strongRegex.test(password) ? 'strong' : 'medium';
  }

  changePassword(): void {
    this.passwordErrors = [];

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordErrors.push('Passwords do not match');
      return;
    }

    alert('Password change API not implemented yet');
  }

  // =========================
  // EMAIL PREFERENCES
  // =========================
  emailPreferences = {
    scholarshipAlerts: true,
    applicationUpdates: true,
    weeklyDigest: false,
    newScholarships: true,
    deadlineReminders: true,
    marketingEmails: false,
  };

  saveEmailPreferences(): void {
    alert('Email preferences saved (API not connected yet)');
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
