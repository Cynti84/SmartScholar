import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UserService, UserProfile } from '../../../../app/core/services/user.service';

@Component({
  selector: 'app-profile',
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

  userProfile: UserProfile = {
    firstName: '',
    lastName: '',
    email: '',

    dateOfBirth: undefined,
    gender: '',
    phoneNumber: '',

    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    },

    education: {
      level: '',
      institution: '',
      fieldOfStudy: '',
      gpa: undefined,
      graduationYear: undefined,
    },

    avatar: '',
  };

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
}
