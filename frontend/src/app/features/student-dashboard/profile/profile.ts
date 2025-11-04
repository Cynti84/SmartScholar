import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  imports: [CommonModule, DashboardLayout, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  menu = [
    { label: 'Overview', route: '/student' },
    { label: 'Scholarships', route: '/student/scholarships' },
    { label: 'Recommendations', route: '/student/recommendations' },
    { label: 'Applied', route: '/student/applied' },
    { label: 'Bookmarked', route: '/student/bookmarked' },
    { label: 'Profile', route: '/student/profile' },
  ];
  activeTab: 'profile' | 'security' | 'preferences' | 'account' = 'profile';

  // Edit modes
  isEditingProfile = false;
  isChangingPassword = false;

  // User data
  userProfile: UserProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@university.edu',
    phone: '+1 (555) 123-4567',
    dateOfBirth: new Date('2000-05-15'),
    address: '123 University Ave, Boston, MA 02115',
    university: 'State University',
    major: 'Computer Science',
    gpa: 3.8,
    graduationYear: 2026,
    studentId: 'STU-2024-001',
    role: 'student',
    accountCreated: new Date('2024-01-15'),
    lastLogin: new Date('2025-11-04'),
    profileImage: undefined,
  };

  // Backup for cancel
  profileBackup: UserProfile = { ...this.userProfile };

  // Email preferences
  emailPreferences: EmailPreferences = {
    scholarshipAlerts: true,
    applicationUpdates: true,
    weeklyDigest: true,
    marketingEmails: false,
    newScholarships: true,
    deadlineReminders: true,
  };

  // Password change
  passwordData: PasswordChange = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  // Password visibility
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Validation
  passwordErrors: string[] = [];
  profileErrors: string[] = [];

  // Loading states
  isSaving = false;
  isDeleting = false;

  // Profile completion
  profileCompletion = 0;

  // File upload
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.calculateProfileCompletion();
  }

  // Tab Navigation
  switchTab(tab: 'profile' | 'security' | 'preferences' | 'account'): void {
    this.activeTab = tab;
  }

  // Profile Editing
  enableEditMode(): void {
    this.profileBackup = { ...this.userProfile };
    this.isEditingProfile = true;
  }

  cancelEdit(): void {
    this.userProfile = { ...this.profileBackup };
    this.isEditingProfile = false;
    this.profileErrors = [];
    this.imagePreview = null;
    this.selectedFile = null;
  }

  saveProfile(): void {
    this.profileErrors = [];

    // Validate
    if (!this.userProfile.firstName || this.userProfile.firstName.trim().length < 2) {
      this.profileErrors.push('First name must be at least 2 characters');
    }

    if (!this.userProfile.lastName || this.userProfile.lastName.trim().length < 2) {
      this.profileErrors.push('Last name must be at least 2 characters');
    }

    if (this.userProfile.phone && !this.validatePhone(this.userProfile.phone)) {
      this.profileErrors.push('Invalid phone number format');
    }

    if (this.userProfile.gpa && (this.userProfile.gpa < 0 || this.userProfile.gpa > 4.0)) {
      this.profileErrors.push('GPA must be between 0.0 and 4.0');
    }

    if (this.profileErrors.length > 0) {
      return;
    }

    this.isSaving = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Saving profile:', this.userProfile);

      // If file was selected, upload it
      if (this.selectedFile) {
        this.uploadProfileImage();
      }

      this.isEditingProfile = false;
      this.isSaving = false;
      this.calculateProfileCompletion();
      alert('Profile updated successfully!');
    }, 1500);
  }

  // Profile Image
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      this.selectedFile = file;

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result || null;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfileImage(): void {
    console.log('Uploading image:', this.selectedFile);
    // Implement actual upload to server
    if (this.imagePreview) {
      this.userProfile.profileImage = this.imagePreview as string;
    }
  }

  removeProfileImage(): void {
    if (confirm('Remove profile picture?')) {
      this.userProfile.profileImage = undefined;
      this.imagePreview = null;
      this.selectedFile = null;
    }
  }

  // Password Change
  enablePasswordChange(): void {
    this.isChangingPassword = true;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    this.passwordErrors = [];
  }

  cancelPasswordChange(): void {
    this.isChangingPassword = false;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    this.passwordErrors = [];
  }

  changePassword(): void {
    this.passwordErrors = [];

    // Validate
    if (!this.passwordData.currentPassword) {
      this.passwordErrors.push('Current password is required');
    }

    if (!this.passwordData.newPassword) {
      this.passwordErrors.push('New password is required');
    } else {
      // Password strength validation
      if (this.passwordData.newPassword.length < 8) {
        this.passwordErrors.push('Password must be at least 8 characters');
      }

      if (!/(?=.*[a-z])/.test(this.passwordData.newPassword)) {
        this.passwordErrors.push('Password must contain lowercase letter');
      }

      if (!/(?=.*[A-Z])/.test(this.passwordData.newPassword)) {
        this.passwordErrors.push('Password must contain uppercase letter');
      }

      if (!/(?=.*\d)/.test(this.passwordData.newPassword)) {
        this.passwordErrors.push('Password must contain number');
      }

      if (!/(?=.*[@$!%*?&])/.test(this.passwordData.newPassword)) {
        this.passwordErrors.push('Password must contain special character');
      }
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordErrors.push('Passwords do not match');
    }

    if (this.passwordData.currentPassword === this.passwordData.newPassword) {
      this.passwordErrors.push('New password must be different from current password');
    }

    if (this.passwordErrors.length > 0) {
      return;
    }

    this.isSaving = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Changing password');
      this.isChangingPassword = false;
      this.isSaving = false;
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
      alert('Password changed successfully!');
    }, 1500);
  }

  getPasswordStrength(): string {
    const password = this.passwordData.newPassword;
    if (!password) return 'none';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  // Email Preferences
  saveEmailPreferences(): void {
    this.isSaving = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Saving email preferences:', this.emailPreferences);
      this.isSaving = false;
      alert('Email preferences updated successfully!');
    }, 1000);
  }

  // Account Management
  deleteAccount(): void {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');

    if (confirmation === 'DELETE') {
      this.isDeleting = true;

      // Simulate API call
      setTimeout(() => {
        console.log('Deleting account');
        alert('Account deleted. You will be logged out.');
        // Logout and redirect
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }, 2000);
    } else if (confirmation !== null) {
      alert('Account deletion cancelled. Please type "DELETE" exactly.');
    }
  }

  downloadData(): void {
    console.log('Downloading user data');
    alert('Your data will be emailed to you within 24 hours.');
  }

  // Validation Helpers
  validatePhone(phone: string): boolean {
    // Basic phone validation
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  }

  calculateProfileCompletion(): void {
    const fields = [
      this.userProfile.firstName,
      this.userProfile.lastName,
      this.userProfile.email,
      this.userProfile.phone,
      this.userProfile.dateOfBirth,
      this.userProfile.address,
      this.userProfile.university,
      this.userProfile.major,
      this.userProfile.gpa,
      this.userProfile.graduationYear,
    ];

    const completed = fields.filter(
      (field) => field !== undefined && field !== null && field !== ''
    ).length;
    this.profileCompletion = Math.round((completed / fields.length) * 100);
  }

  // Utility
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getInitials(): string {
    return `${this.userProfile.firstName.charAt(0)}${this.userProfile.lastName.charAt(
      0
    )}`.toUpperCase();
  }
}
