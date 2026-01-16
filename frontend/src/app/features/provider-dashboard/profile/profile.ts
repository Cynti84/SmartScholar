import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { ProviderService } from '../../../core/services/provider.service';

interface Country {
  name: string;
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

  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;

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
    { name: 'United States' },
    { name: 'Canada' },
    { name: 'United Kingdom' },
    { name: 'Germany' },
    { name: 'France' },
    { name: 'Australia' },
    { name: 'Kenya' },
    { name: 'South Africa' },
    { name: 'Nigeria' },
    { name: 'Ghana' },
    { name: 'Japan' },
    { name: 'South Korea' },
    { name: 'Singapore' },
    { name: 'India' },
    { name: 'Brazil' },
    { name: 'Mexico' },
    { name: 'Argentina' },
    { name: 'Chile' },
    { name: 'Netherlands' },
    { name: 'Sweden' },
    { name: 'Norway' },
    { name: 'Denmark' },
    { name: 'Finland' },
    { name: 'Switzerland' },
    { name: 'Austria' },
    { name: 'Belgium' },
    { name: 'Italy' },
    { name: 'Spain' },
    { name: 'Portugal' },
    { name: 'Ireland' },
    { name: 'New Zealand' },
    { name: 'China' },
    { name: 'Thailand' },
    { name: 'Malaysia' },
    { name: 'Indonesia' },
    { name: 'Philippines' },
    { name: 'Vietnam' },
    { name: 'Egypt' },
    { name: 'Morocco' },
    { name: 'Tunisia' },
    { name: 'Ethiopia' },
    { name: 'Uganda' },
    { name: 'Tanzania' },
    { name: 'Rwanda' },
    { name: 'Zambia' },
    { name: 'Botswana' },
    { name: 'Namibia' },
  ];

  private originalFormData: any;
  private originalEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private providerService: ProviderService
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.initializeForms();
    this.loadProfileData();
    this.watchEmailChanges();
  }

  private initializeForms() {
    this.profileForm = this.fb.group({
      organizationName: ['', [Validators.required, Validators.minLength(2)]],
      providerType: ['', Validators.required],
      country: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern(/^[+]?[\d\s\-()]{7,20}$/)],
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

  private mapProviderTypeToValue(type: string): string {
    const map: Record<string, string> = {
      'University/Educational Institution': 'university',
      NGO: 'ngo',
      'Government Agency': 'government',
      Foundation: 'foundation',
      'Private Company/Corporation': 'corporation',
      'Religious Organization': 'religious',
      'Community-Based Organization': 'community-based',
      'International Organization': 'international',
      'Research Institute': 'research-institute',
      'Healthcare Organization': 'healthcare',
      Other: 'other',
    };

    return map[type] || '';
  }

  private passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private loadProfileData() {
    this.providerService.getProvider().subscribe({
      next: (res) => {
        const provider = res;

        this.profileForm.patchValue({
          organizationName: provider.organization_name,
          providerType: provider.organization_type,
          country: provider.country,
          email: provider.user.email,
          phone: provider.phone,
        });

        this.originalFormData = { ...this.profileForm.value };
        this.originalEmail = provider.user.email;

        this.verificationStatus = provider.verified ? 'verified' : 'pending';

        this.logoPreview = provider.logo_url || null;
      },
      error: (err) => {
        console.error('Failed to load provider profile', err);
      },
    });
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

    if (!file) return;

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

    // Show immediate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.logoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
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
    if (this.profileForm.invalid) {
      Object.values(this.profileForm.controls).forEach((c) => c.markAsTouched());
      return;
    }

    this.saving = true;

    const formData = new FormData();
    const value = this.profileForm.value;

    formData.append('organization_name', value.organizationName);
    formData.append('organization_type', value.providerType);
    formData.append('country', value.country);
    formData.append('phone', value.phone || '');
    formData.append('email', value.email || '');

    if (this.logoInput?.nativeElement.files?.[0]) {
      formData.append('logo', this.logoInput.nativeElement.files[0]);
    }

    this.uploadedDocuments.forEach((doc) => {
      formData.append('verification_documents', doc.file);
    });

    this.providerService.updateProvider(formData).subscribe({
      next: () => {
        this.saving = false;
        this.originalFormData = { ...this.profileForm.value };
        this.originalEmail = value.email;
        this.emailChanged = false;
        this.profileForm.markAsPristine();
        alert('Profile updated successfully!');
      },
      error: (err) => {
        console.error('Update failed', err);
        this.saving = false;
      },
    });
  }

  onReset() {
    this.profileForm.patchValue(this.originalFormData);
    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();
    this.emailChanged = false;

    this.loadProfileData();
    this.uploadedDocuments = [];
  }

  onPasswordChange() {
    if (this.passwordForm.invalid) {
      Object.values(this.passwordForm.controls).forEach((c) => c.markAsTouched());
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.changingPassword = true;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.changingPassword = false;
        this.closePasswordModal();
        alert('Password updated successfully!');
      },
      error: (err) => {
        console.error('Password change failed', err);
        this.changingPassword = false;
        alert('Failed to change password');
      },
    });
  }

  onDeactivateAccount() {
    this.deactivating = true;

    this.providerService.deleteProvider().subscribe({
      next: () => {
        this.deactivating = false;
        this.closeDeactivateModal();
        alert('Account deactivated');
        this.authService.logout().subscribe(() => {
          this.router.navigate(['/auth/login']);
        });
      },
      error: (err) => {
        console.error('Deactivation failed', err);
        this.deactivating = false;
      },
    });
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
