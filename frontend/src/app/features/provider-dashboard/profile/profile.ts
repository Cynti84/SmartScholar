import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

interface Country {
  name: string;
  code: string;
}

interface UploadedDocument {
  name: string;
  size: number;
  file: File;
}

type VerificationStatus = 'pending' | 'verified' | 'rejected';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, DashboardLayout, ReactiveFormsModule, ConfirmModal],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  menu = [
    { label: 'Overview', route: '/provider' },
    { label: 'Post Scholarships', route: '/provider/post' },
    { label: 'Manage Scholarships', route: '/provider/manage' },
    { label: 'Applicants', route: '/provider/applicants' },
    { label: 'Profile', route: '/provider/profile' },
    { label: 'Logout', action: 'logout' },
  ];

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // State variables
  saving = false;
  changingPassword = false;
  deactivating = false;
  emailChanged = false;
  logoPreview: string | null = null;
  uploadedDocuments: UploadedDocument[] = [];

  // Modal states
  showPasswordModal = false;
  showDeactivateModal = false;

  // Verification status
  verificationStatus: VerificationStatus = 'pending';
  rejectionReason = '';

  // Countries list (sample - you can replace with your actual list)
  countries: Country[] = [
    { name: 'United States', code: 'US' },
    { name: 'Canada', code: 'CA' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'Australia', code: 'AU' },
    { name: 'Kenya', code: 'KE' },
    { name: 'South Africa', code: 'ZA' },
    { name: 'Nigeria', code: 'NG' },
    { name: 'Ghana', code: 'GH' },
    { name: 'Japan', code: 'JP' },
    { name: 'South Korea', code: 'KR' },
    { name: 'Singapore', code: 'SG' },
    { name: 'India', code: 'IN' },
    { name: 'Brazil', code: 'BR' },
    { name: 'Mexico', code: 'MX' },
    { name: 'Argentina', code: 'AR' },
    { name: 'Chile', code: 'CL' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'Sweden', code: 'SE' },
    { name: 'Norway', code: 'NO' },
    { name: 'Denmark', code: 'DK' },
    { name: 'Finland', code: 'FI' },
    { name: 'Switzerland', code: 'CH' },
    { name: 'Austria', code: 'AT' },
    { name: 'Belgium', code: 'BE' },
    { name: 'Italy', code: 'IT' },
    { name: 'Spain', code: 'ES' },
    { name: 'Portugal', code: 'PT' },
    { name: 'Ireland', code: 'IE' },
    { name: 'New Zealand', code: 'NZ' },
    { name: 'China', code: 'CN' },
    { name: 'Thailand', code: 'TH' },
    { name: 'Malaysia', code: 'MY' },
    { name: 'Indonesia', code: 'ID' },
    { name: 'Philippines', code: 'PH' },
    { name: 'Vietnam', code: 'VN' },
    { name: 'Egypt', code: 'EG' },
    { name: 'Morocco', code: 'MA' },
    { name: 'Tunisia', code: 'TN' },
    { name: 'Ethiopia', code: 'ET' },
    { name: 'Uganda', code: 'UG' },
    { name: 'Tanzania', code: 'TZ' },
    { name: 'Rwanda', code: 'RW' },
    { name: 'Zambia', code: 'ZM' },
    { name: 'Botswana', code: 'BW' },
    { name: 'Namibia', code: 'NA' },
  ];

  private originalFormData: any;
  private originalEmail: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadProfileData();
    this.watchEmailChanges();
  }

  private initializeForms() {
    this.profileForm = this.fb.group({
      organizationName: ['', [Validators.required, Validators.minLength(2)]],
      providerType: ['', Validators.required],
      country: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      website: ['', [Validators.pattern(/^https?:\/\/.+\..+/)]],
      socialLinks: [''],
      twoFactorEnabled: [false],
      notifyScholarshipExpiry: [true],
      notifyNewApplications: [true],
      notifySystemUpdates: [false],
      defaultDashboardView: ['overview'],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    // Store original form data for reset functionality
    this.originalFormData = this.profileForm.value;
  }

  private passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private loadProfileData() {
    // Simulate loading existing profile data
    // In a real app, you'd call your service here
    const mockData = {
      organizationName: 'Tech University Foundation',
      providerType: 'university',
      country: 'US',
      email: 'scholarships@techuniv.edu',
      phone: '+1-555-123-4567',
      website: 'https://www.techuniv.edu',
      socialLinks:
        'LinkedIn: https://linkedin.com/company/techuniv\nTwitter: https://twitter.com/techuniv',
      twoFactorEnabled: false,
      notifyScholarshipExpiry: true,
      notifyNewApplications: true,
      notifySystemUpdates: false,
      defaultDashboardView: 'overview',
    };

    this.profileForm.patchValue(mockData);
    this.originalFormData = { ...mockData };
    this.originalEmail = mockData.email;

    // Mock verification status - change these values to test different states
    this.verificationStatus = 'verified'; // Change to 'pending' or 'rejected' to test other states
    this.rejectionReason = 'Documents were not clear enough. Please upload higher quality scans.';

    // Mock existing logo
    this.logoPreview = 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=ORG';
  }

  private watchEmailChanges() {
    this.profileForm.get('email')?.valueChanges.subscribe((newEmail) => {
      this.emailChanged = newEmail !== this.originalEmail;
    });
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isPasswordFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    if (fieldName === 'confirmPassword') {
      return !!(
        field &&
        (field.invalid || this.passwordForm.hasError('passwordMismatch')) &&
        (field.dirty || field.touched)
      );
    }
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // File upload handlers
  onLogoSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        target.value = '';
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo() {
    this.logoPreview = null;
    // Reset file input by finding it with a more specific selector
    const logoInput = document.querySelector(
      'input[type="file"][accept="image/*"]'
    ) as HTMLInputElement;
    if (logoInput) {
      logoInput.value = '';
    }
  }

  // Method to trigger logo file input click
  triggerLogoUpload() {
    const logoInput = document.querySelector(
      'input[type="file"][accept="image/*"]'
    ) as HTMLInputElement;
    if (logoInput) {
      logoInput.click();
    }
  }

  // Method to trigger document file input click
  triggerDocumentUpload() {
    const docInput = document.querySelector(
      'input[type="file"][accept=".pdf,.doc,.docx"]'
    ) as HTMLInputElement;
    if (docInput) {
      docInput.click();
    }
  }

  onDocumentSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);

    for (const file of files) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        alert(`File ${file.name} is not supported. Please upload PDF, DOC, or DOCX files.`);
        continue;
      }

      // Check if file already exists
      const existingFile = this.uploadedDocuments.find((doc) => doc.name === file.name);
      if (existingFile) {
        alert(`File ${file.name} is already uploaded.`);
        continue;
      }

      this.uploadedDocuments.push({
        name: file.name,
        size: file.size,
        file: file,
      });
    }

    // Reset file input
    target.value = '';
  }

  removeDocument(index: number) {
    this.uploadedDocuments.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Verification status helpers
  getVerificationStatusText(): string {
    switch (this.verificationStatus) {
      case 'pending':
        return 'Verification Pending';
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Verification Rejected';
      default:
        return 'Unknown Status';
    }
  }

  // Modal handlers
  openPasswordModal() {
    this.showPasswordModal = true;
    this.passwordForm.reset();
  }

  closePasswordModal() {
    this.showPasswordModal = false;
    this.passwordForm.reset();
  }

  openDeactivateModal() {
    this.showDeactivateModal = true;
  }

  closeDeactivateModal() {
    this.showDeactivateModal = false;
  }

  // Form submission handlers
  onSave() {
    if (this.profileForm.valid) {
      this.saving = true;

      // Simulate API call
      setTimeout(() => {
        console.log('Profile saved:', this.profileForm.value);
        console.log('Logo file:', this.logoPreview ? 'Updated' : 'No change');
        console.log(
          'Documents:',
          this.uploadedDocuments.map((doc) => doc.name)
        );

        this.saving = false;
        this.originalFormData = { ...this.profileForm.value };
        this.originalEmail = this.profileForm.get('email')?.value || '';
        this.emailChanged = false;

        // Mark form as pristine
        this.profileForm.markAsPristine();

        // Show success message (you can implement a toast/notification service)
        alert('Profile updated successfully!');
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach((key) => {
        this.profileForm.get(key)?.markAsTouched();
      });
    }
  }

  onReset() {
    this.profileForm.patchValue(this.originalFormData);
    this.profileForm.markAsUntouched();
    this.profileForm.markAsPristine();
    this.emailChanged = false;

    // Reset logo to original (in real app, you'd load from server)
    this.logoPreview = 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=ORG';

    // Reset documents (in real app, you'd reload from server)
    this.uploadedDocuments = [];
  }

  onPasswordChange() {
    if (this.passwordForm.valid) {
      this.changingPassword = true;

      // Simulate API call
      setTimeout(() => {
        console.log('Password changed successfully');
        this.changingPassword = false;
        this.closePasswordModal();

        // Show success message
        alert('Password updated successfully!');
      }, 1500);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.passwordForm.controls).forEach((key) => {
        this.passwordForm.get(key)?.markAsTouched();
      });
    }
  }

  onDeactivateAccount() {
    this.deactivating = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Account deactivated');
      this.deactivating = false;
      this.closeDeactivateModal();

      // Show success message and potentially redirect
      alert('Account has been deactivated. You will be redirected to the login page.');
      // In a real app, you'd redirect to login or home page
      // this.router.navigate(['/login']);
    }, 2000);
  }

  // Helper method to prevent event propagation (used in template)
  stopPropagation(event: Event) {
    event.stopPropagation();
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
