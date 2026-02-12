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

  educationLevels = [
    'High School / Secondary',
    "Undergraduate / Bachelor's",
    "Graduate / Master's",
    'Doctorate / PhD',
    'Postdoctoral',
    'Professional Certification',
    'Vocational / Technical',
    'Other',
  ];

  fieldsOfStudy = [
    'Engineering',
    'Medicine',
    'Technology',
    'Business',
    'Law',
    'Education',
    'Arts',
    'Agriculture',
    'Architecture',
    'Nursing',
    'Pharmacy',
    'Veterinary',
    'Economics',
    'Psychology',
  ];

  interests = [
    'Technology',
    'Engineering',
    'Business_and_Economics',
    'Health_and_Medicine',
    'Natural_Sciences',
    'Arts_and_Design',
    'Social_Sciences_and_Humanities',
    'General',
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
    const profileFields = [
      'country',
      'academic_level',
      'field_of_study',
      'interest',
      'gender',
      'date_of_birth',
      'income_level',
      'is_disabled',
    ] as const;

    const filledFields = profileFields.filter((field) => !!this.studentProfile[field]).length;

    completion += Math.floor((filledFields / profileFields.length) * 45);
    // 3️⃣ Email preferences (20%)
    // 3️⃣ Email preferences (20%)
    if (this.emailPreferencesLoaded) {
      completion += 10;
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
    income_level: undefined,
    profile_image_url: '',
    cv_url: '',
    is_disabled: false,
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
        this.syncGpaRangeFromProfile();
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
  private syncGpaRangeFromProfile(): void {
    const min = this.studentProfile.gpa_min;
    const max = this.studentProfile.gpa_max;

    if (min === null || min === undefined || max === null || max === undefined) {
      this.selectedGpaRange = '';
      return;
    }

    // Reverse lookup: numbers → dropdown key
    const match = Object.entries(this.gpaRangeMap).find(
      ([_, range]) => range.min === min && range.max === max
    );

    this.selectedGpaRange = match ? match[0] : '';
  }

  // load user

  // =========================
  // SAVE / UPDATE PROFILE
  // =========================
  saveProfile(): void {
    this.profileErrors = [];
    this.isSaving = true;

    // Build payload manually so null values survive serialization
    const payload: Record<string, any> = {
      country: this.studentProfile.country,
      academic_level: this.studentProfile.academic_level,
      field_of_study: this.studentProfile.field_of_study,
      interest: this.studentProfile.interest,
      gender: this.studentProfile.gender,
      date_of_birth: this.studentProfile.date_of_birth,
      income_level: this.studentProfile.income_level,
      is_disabled: this.studentProfile.is_disabled,
      // Explicitly include gpa — use undefined only if truly unset
      gpa_min: this.studentProfile.gpa_min !== undefined ? this.studentProfile.gpa_min : null,
      gpa_max: this.studentProfile.gpa_max !== undefined ? this.studentProfile.gpa_max : null,
    };

    this.studentProfileService.updateProfile(payload).subscribe({
      next: () => {
        alert('Profile updated successfully');
        this.isEditingProfile = false;
        this.loadStudentProfile();
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
    this.syncGpaRangeFromProfile();
  }

  // =========================
  // PROFILE IMAGE
  // =======================
  // =========================
  // PROFILE IMAGE
  // =========================
  imagePreview: string | null = null;
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('profileImage', file);

    // Append ALL current profile fields so nothing gets wiped
    formData.append('country', this.studentProfile.country ?? '');
    formData.append('academic_level', this.studentProfile.academic_level ?? '');
    formData.append('field_of_study', this.studentProfile.field_of_study ?? '');
    formData.append('interest', this.studentProfile.interest ?? '');
    formData.append('gender', this.studentProfile.gender ?? '');
    formData.append('date_of_birth', this.studentProfile.date_of_birth?.toString() ?? '');
    formData.append('income_level', this.studentProfile.income_level ?? '');
    formData.append('is_disabled', String(this.studentProfile.is_disabled ?? false));
    formData.append(
      'gpa_min',
      this.studentProfile.gpa_min !== null && this.studentProfile.gpa_min !== undefined
        ? String(this.studentProfile.gpa_min)
        : ''
    );
    formData.append(
      'gpa_max',
      this.studentProfile.gpa_max !== null && this.studentProfile.gpa_max !== undefined
        ? String(this.studentProfile.gpa_max)
        : ''
    );

    this.studentProfileService.updateProfile(formData).subscribe({
      next: (res) => {
        this.studentProfile = res.data;
        this.syncGpaRangeFromProfile(); // keep dropdown in sync after image upload
      },
      error: (err) => {
        console.error('Failed to upload profile image', err);
      },
    });
  }

  removeProfileImage(): void {
    const formData = new FormData();
    formData.append('removeProfileImage', 'true');

    this.studentProfileService.updateProfile(formData).subscribe({
      next: (res) => {
        this.studentProfile = res.data;
        this.imagePreview = null;
      },
      error: (err) => {
        console.error('Failed to remove profile image', err);
      },
    });
  }
  selectedGpaRange: string = '';

  private gpaRangeMap: Record<string, { min: number | null; max: number | null }> = {
    below_2_5: { min: 0.0, max: 2.49 },
    '2_5_2_99': { min: 2.5, max: 2.99 },
    '3_0_3_49': { min: 3.0, max: 3.49 },
    '3_5_4_0': { min: 3.5, max: 4.0 },
  };

  onGpaRangeChange(): void {
    if (!this.selectedGpaRange) {
      this.studentProfile.gpa_min = null;
      this.studentProfile.gpa_max = null;
      return;
    }

    const range = this.gpaRangeMap[this.selectedGpaRange];

    this.studentProfile.gpa_min = range.min;
    this.studentProfile.gpa_max = range.max;
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
