import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StudentProfileService, StudentProfile } from '../../../core/services/studentProfile';
import { AuthService, user } from '../../../core/services/auth.service';

export type ProfileTab = 'profile' | 'security' | 'preferences' | 'account';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DashboardLayout, FormsModule, ReactiveFormsModule, MatIconModule],
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
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null = null;

  studentProfile: StudentProfile = {
    country: '',
    academic_level: '',
    field_of_study: '',
    interest: '',
    gender: undefined,
    date_of_birth: undefined,
    financial_need: undefined,
    profile_image_url: '',
    cv_url: '',
  };
  activeTab: ProfileTab;
  constructor(
    private studentProfileService: StudentProfileService,
    private authService: AuthService,
    private router: Router
  ) {
    this.activeTab = 'profile';
  }
  // =========================
  // TAB NAVIGATION
  // =========================

  switchTab(tab: ProfileTab): void {
    this.activeTab = tab;
  }

  // =========================
  // LOAD PROFILE
  // =========================
  ngOnInit(): void {
    this.loadUser();
    this.loadStudentProfile();
  }

  loadUser(): void {
    this.authService.getMe().subscribe({
      next: (res) => {
        this.user = res.user ?? null;
      },
      error: () => alert('Failed to load user'),
    });
  }

  loadStudentProfile(): void {
    this.studentProfileService.getProfile().subscribe({
      next: (profile) => {
        this.studentProfile = profile;
      },
      error: (err) => {
        if (err.status !== 404) {
          alert('Failed to load student profile');
        }
      },
    });
  }

  // =========================
  // SAVE / UPDATE PROFILE
  // =========================
  saveProfile(): void {
    this.profileErrors = [];
    this.isSaving = true;

    this.studentProfileService.updateProfile(this.studentProfile).subscribe({
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

    this.studentProfileService.createProfile(this.studentProfile).subscribe({
      next: () => alert('Profile created successfully'),
      error: (err) => this.profileErrors.push(err.error?.message || 'Failed to create profile'),
      complete: () => (this.isSaving = false),
    });
  }

  // =========================
  // DELETE PROFILE
  // =========================
  deleteProfile(): void {
    if (!confirm('Delete your student profile?')) return;

    this.isDeleting = true;

    this.studentProfileService.deleteProfile().subscribe({
      next: () => {
        alert('Profile deleted');
        this.studentProfile = {
          country: '',
          academic_level: '',
          field_of_study: '',
        } as StudentProfile;
      },
      error: () => alert('Failed to delete profile'),
      complete: () => (this.isDeleting = false),
    });
  }

  // =========================
  // DOWNLOAD PROFILE
  // =========================
  downloadProfile(): void {
    this.studentProfileService.downloadProfile().subscribe({
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
  // HELPERS (USED BY HTML)
  // =========================
  getInitials(): string {
    if (!this.user) return '';
    return (this.user.firstName.charAt(0) + this.user.lastName.charAt(0)).toUpperCase();
  }

  // =========================
  // EDIT MODE
  // =========================
  enableEditMode(): void {
    this.isEditingProfile = true;
  }

  cancelEdit(): void {
    this.isEditingProfile = false;
    this.loadStudentProfile(); // reset changes
  }

  // =========================
  // PROFILE IMAGE
  // =======================
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
      this.studentProfile.profile_image_url = this.imagePreview!;
    };
    reader.readAsDataURL(file);
  }

  removeProfileImage(): void {
    this.imagePreview = null;
    this.studentProfile.profile_image_url = '';
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
  deleteAccount(): void {
    if (!confirm('Are you sure you want to delete your account?')) return;
    alert('Delete account API not implemented yet');
  }
}
