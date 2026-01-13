import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StudentProfileService, StudentProfile } from '../../../core/services/studentProfile';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

export type ProfileTab = 'profile' | 'security' | 'preferences' | 'account';
interface ProfileUser {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
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
  profileLoaded = false;
  emailPreferencesLoaded = false;
  emailPreferencesTouched = false;

  profileErrors: string[] = [];

  profileCompletion = 0;

  readonly DEFAULT_EMAIL_PREFS = {
    scholarshipAlerts: true,
    applicationUpdates: true,
    weeklyDigest: false,
    newScholarships: true,
    deadlineReminders: true,
    marketingEmails: false,
  };

  calculateProfileCompletion() {
    let completion = 0;

    // 1️⃣ Basic info (25%)
    if (this.user?.firstName && this.user?.lastName && this.user?.email) {
      completion += 25;
    }

    // 2️⃣ Student profile (35%)
    if (
      this.studentProfile?.country &&
      this.studentProfile?.academic_level &&
      this.studentProfile?.field_of_study
    ) {
      completion += 35;
    }

    // 3️⃣ Email preferences (20%)
    // 3️⃣ Email preferences (20%)
    if (this.emailPreferencesLoaded) {
      completion += 20;
    }

    // 4️⃣ Extras (20%)
    if (this.studentProfile?.profile_image_url || this.studentProfile?.cv_url) {
      completion += 20;
    }

    this.profileCompletion = Math.min(completion, 100);
  }

  user?: ProfileUser;
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

    this.load2FAStatus();
    this.loadEmailPreferences();
  }

  loadUser(): void {
    this.authService.getMe().subscribe({
      next: (res) => {
        this.user = res.data.user;

        // this.calculateProfileCompletion();
      },
      error: () => {
        console.error('Failed to load user');
        this.user = undefined;
      },
    });
  }
  loadStudentProfile(): void {
    this.profileLoaded = false;

    this.studentProfileService.getProfile().subscribe({
      next: (profile) => {
        this.studentProfile = { ...profile }; // force new reference
        this.profileLoaded = true;

        this.calculateProfileCompletion(); // 👈 recalc here
      },
      error: (err) => {
        if (err.status !== 404) {
          alert('Failed to load student profile');
        }

        this.profileLoaded = true;
        this.profileCompletion = 0;
      },
    });
  }

  // load user

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

    this.isSaving = true;

    this.authService
      .changePassword(this.passwordData.currentPassword, this.passwordData.newPassword)
      .subscribe({
        next: () => {
          alert('Password changed successfully');
          this.cancelPasswordChange();
        },
        error: (err) => {
          this.passwordErrors.push(err.error?.message || 'Failed to change password');
        },
        complete: () => (this.isSaving = false),
      });
  }

  // =========================
  // TWO-FACTOR AUTH (2FA)
  // =========================

  is2FAEnabled = false;
  is2FALoading = false;
  isEnabling2FA = false;
  isVerifying2FA = false;

  qrCodeImage: string | null = null;
  twoFAToken = '';
  twoFAErrors: string[] = [];

  load2FAStatus(): void {
    this.studentProfileService.get2FAStatus().subscribe({
      next: (res) => {
        this.is2FAEnabled = !!res.data.enabled;
      },
      error: () => {
        this.is2FAEnabled = false;
      },
    });
  }

  //verify 2fa
  enable2FA(): void {
    this.twoFAErrors = [];
    this.isEnabling2FA = true;

    this.studentProfileService.enable2FA().subscribe({
      next: (res) => {
        if (!res.data) {
          this.twoFAErrors.push('Invalid server response');
          return;
        }

        this.qrCodeImage = res.data.qrCode;
      },
      error: (err) => {
        this.twoFAErrors.push(err.error?.message || 'Failed to enable 2FA');
      },
      complete: () => {
        this.isEnabling2FA = false;
      },
    });
  }

  verify2FA(): void {
    this.twoFAErrors = [];

    if (!this.twoFAToken || this.twoFAToken.length !== 6) {
      this.twoFAErrors.push('Enter a valid 6-digit code');
      return;
    }

    this.isVerifying2FA = true;

    this.studentProfileService.verify2FA(this.twoFAToken).subscribe({
      next: () => {
        alert('Two-Factor Authentication enabled successfully');

        this.qrCodeImage = null;
        this.twoFAToken = '';

        // 🔥 THIS IS THE FIX
        this.load2FAStatus();
      },
      error: (err) => {
        this.twoFAErrors.push(err.error?.message || 'Invalid authentication code');
      },
      complete: () => {
        this.isVerifying2FA = false;
      },
    });
  }

  // Disable
  disable2FA(): void {
    this.twoFAErrors = [];

    if (!this.twoFAToken || this.twoFAToken.length !== 6) {
      this.twoFAErrors.push('Enter OTP to disable 2FA');
      return;
    }

    this.studentProfileService.disable2FA(this.twoFAToken).subscribe({
      next: () => {
        alert('2FA disabled');
        this.twoFAToken = '';

        // 🔥 SAME FIX
        this.load2FAStatus();
      },
      error: (err) => {
        this.twoFAErrors.push(err.error?.message || 'Failed to disable 2FA');
      },
    });
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
  loadEmailPreferences(): void {
    this.studentProfileService.getEmailPreferences().subscribe({
      next: (res) => {
        this.emailPreferences = res.data;

        this.emailPreferencesTouched =
          JSON.stringify(res.data) !== JSON.stringify(this.DEFAULT_EMAIL_PREFS);

        this.calculateProfileCompletion();
      },
      error: () => {
        this.emailPreferencesTouched = false;
        this.calculateProfileCompletion();
      },
    });
  }

  saveEmailPreferences(): void {
    this.isSaving = true;

    this.studentProfileService.updateEmailPreferences(this.emailPreferences).subscribe({
      next: () => alert('Preferences saved successfully'),
      error: () => alert('Failed to save preferences'),
      complete: () => (this.isSaving = false),
    });
  }

  deleteAccount(): void {
    if (!confirm('Are you sure you want to delete your account?')) return;
    alert('Delete account API not implemented yet');
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
