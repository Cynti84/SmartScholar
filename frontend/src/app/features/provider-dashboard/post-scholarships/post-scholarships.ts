import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { ProviderService } from '../../../core/services/provider.service';

interface FileUpload {
  name: string;
  size: number;
  type: string;
  file: File;
}
@Component({
  selector: 'app-post-scholarships',
  imports: [CommonModule, DashboardLayout, ReactiveFormsModule, ConfirmModal],
  templateUrl: './post-scholarships.html',
  styleUrl: './post-scholarships.scss',
})
export class PostScholarships implements OnInit {
  isDarkMode = false;

  scholarshipForm!: FormGroup;
  currentStep = 1;
  maxStep = 5;
  isSubmitting = false;
  minDate: string;

  //menu for navigation
  menu = [
    { label: 'Overview', route: '/provider' },
    { label: 'Post Scholarships', route: '/provider/post' },
    { label: 'Manage Scholarships', route: '/provider/manage' },
    { label: 'Applicants', route: '/provider/applicants' },
    { label: 'Profile', route: '/provider/profile' },
    { label: 'Logout', action: 'logout' },
  ];

  // Form options data
  countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Netherlands',
    'Sweden',
    'Norway',
    'Denmark',
    'Switzerland',
    'Singapore',
    'Japan',
    'South Korea',
    'New Zealand',
    'Ireland',
    'Belgium',
    'Austria',
    'Finland',
    'Italy',
    'Spain',
    'Portugal',
    'Czech Republic',
    'Poland',
    'Hungary',
    'Estonia',
    'Latvia',
    'Lithuania',
    'Slovenia',
    'Slovakia',
    'Croatia',
    'Romania',
    'Bulgaria',
    'Cyprus',
    'Malta',
    'Kenya',
    'South Africa',
    'Nigeria',
    'Ghana',
    'Egypt',
    'Morocco',
    'Tunisia',
    'Ethiopia',
    'Tanzania',
    'Uganda',
    'Rwanda',
    'Botswana',
  ];

  educationLevels = [
    'High School / Secondary',
    "Undergraduate / Bachelor's",
    "Graduate / Master's",
    'Doctorate / PhD',
    'Postdoctoral',
    'Professional Certification',
    'Vocational / Technical',
    'Any Level',
  ];

  scholarshipTypes = [
    'Fully Funded',
    'Partial Funding',
    'Tuition Only',
    'Living Expenses Only',
    'Research Grant',
    'Fellowship',
    'Merit-based',
    'Need-based',
    'Sports Scholarship',
    'Minority Scholarship',
    'Women in STEM',
    'International Students',
    'Exchange Program',
  ];

  fieldsOfStudy = [
    'Engineering',
    'Computer Science',
    'Medicine',
    'Business Administration',
    'Economics',
    'Finance',
    'Accounting',
    'Marketing',
    'Management',
    'Law',
    'International Relations',
    'Political Science',
    'Psychology',
    'Sociology',
    'Anthropology',
    'History',
    'Literature',
    'Linguistics',
    'Education',
    'Social Work',
    'Public Health',
    'Nursing',
    'Pharmacy',
    'Dentistry',
    'Veterinary Science',
    'Biology',
    'Chemistry',
    'Physics',
    'Mathematics',
    'Statistics',
    'Environmental Science',
    'Agriculture',
    'Architecture',
    'Urban Planning',
    'Art',
    'Design',
    'Music',
    'Theatre',
    'Film Studies',
    'Journalism',
    'Communications',
    'Philosophy',
    'Theology',
    'Geography',
    'Geology',
    'Astronomy',
    'Data Science',
    'Artificial Intelligence',
    'Cybersecurity',
    'Information Technology',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Biomedical Engineering',
    'Environmental Engineering',
  ];

  selectedFields: string[] = [];

  //file upload properties
  selectedFlyer: FileUpload | null = null;
  selectedBanner: FileUpload | null = null;
  selectedVerificationDocs: FileUpload[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,
    private authService: AuthService,
    private providerScholarshipService: ProviderService
  ) {
    //set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadDraft();
  }

  private initializeForm(): void {
    this.scholarshipForm = this.fb.group({
      // Step 1
      title: ['', [Validators.required, Validators.minLength(10)]],
      organization_name: ['', [Validators.required]],
      short_summary: ['', [Validators.required, Validators.maxLength(200)]],

      // Step 2
      description: ['', [Validators.required, Validators.minLength(50)]],
      eligibility_criteria: ['', [Validators.required]],
      benefits: ['', [Validators.required]],
      deadline: ['', [Validators.required, this.futureDateValidator]],

      // Step 3
      country: ['', [Validators.required]],
      education_level: ['', [Validators.required]],
      scholarship_type: ['', [Validators.required]],
      fields_of_study: ['', [Validators.required]],

      // Step 4
      application_link: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      application_instructions: ['', [Validators.required]],
      contact_email: ['', [Validators.email]],
      contact_phone: [''],

      // Step 5
      admin_notes: [''],
    });


    //Auto-fill organization name from user profile (if available)
    this.scholarshipForm.patchValue({
      organization_name: 'Your Organization Name', //replace with actual user data
    });
  }

  //custom validator for future dats
  private futureDateValidator(control: any) {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate <= today ? { pastDate: true } : null;
  }

  //Navigation methods
  nextStep(): void {
    if (this.isCurrentStepValid() && this.currentStep < this.maxStep) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  //Validation methods
  isCurrentStepValid(): boolean {
    switch (this.currentStep) {
      case 1:
        return (
          (this.scholarshipForm.get('title')?.valid ?? false) &&
          (this.scholarshipForm.get('organization_name')?.valid ?? false) &&
          (this.scholarshipForm.get('short_summary')?.valid ?? false)
        );
      case 2:
        return (
          (this.scholarshipForm.get('description')?.valid ?? false) &&
          (this.scholarshipForm.get('eligibility_criteria')?.valid ?? false) &&
          (this.scholarshipForm.get('benefits')?.valid ?? false) &&
          (this.scholarshipForm.get('deadline')?.valid ?? false)
        );
      case 3:
        return (
          (this.scholarshipForm.get('country')?.valid ?? false) &&
          (this.scholarshipForm.get('education_level')?.valid ?? false) &&
          (this.scholarshipForm.get('scholarship_type')?.valid ?? false) &&
          this.selectedFields.length > 0
        );
      case 4:
        return (
          (this.scholarshipForm.get('application_link')?.valid ?? false) &&
          (this.scholarshipForm.get('application_instructions')?.valid ?? false)
        );
      case 5:
        return true; // Step 5 has no required fields
      default:
        return false;
    }
  }

  //fields of study management
  addField(field: string): void {
    if (!this.selectedFields.includes(field)) {
      this.selectedFields.push(field);
      this.scholarshipForm.patchValue({
        fields_of_study: this.selectedFields.join(','),
      });
    }
  }

  removeField(field: string): void {
    this.selectedFields = this.selectedFields.filter((f) => f !== field);
    this.scholarshipForm.patchValue({
      fields_of_study: this.selectedFields.join(','),
    });
  }

  getAvailableFields(): string[] {
    return this.fieldsOfStudy.filter((field) => !this.selectedFields.includes(field));
  }

  //file upload methods
  onFileSelect(event: Event, type: 'flyer' | 'banner' | 'verification'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);

    switch (type) {
      case 'flyer':
        if (this.validateFile(files[0], ['pdf', 'jpg', 'jpeg', 'png'], 5)) {
          this.selectedFlyer = this.createFileUpload(files[0]);
        }
        break;
      case 'banner':
        if (this.validateFile(files[0], ['jpg', 'jpeg', 'png'], 2)) {
          this.selectedBanner = this.createFileUpload(files[0]);
        }
        break;
      case 'verification':
        const validFiles = files.filter((file) =>
          this.validateFile(file, ['pdf', 'doc', 'docx'], 10)
        );
        this.selectedVerificationDocs = validFiles.map((file) => this.createFileUpload(file));
        break;
    }

    // Reset input
    input.value = '';
  }

  private validateFile(file: File, allowedTypes: string[], maxSizeMB: number): boolean {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const fileSizeMB = file.size / (1024 * 1024);

    if (!allowedTypes.includes(fileExtension)) {
      alert(`File type not allowed. Please select: ${allowedTypes.join(', ')}`);
      return false;
    }

    if (fileSizeMB > maxSizeMB) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    return true;
  }

  private createFileUpload(file: File): FileUpload {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    };
  }

  removeFile(type: 'flyer' | 'banner' | 'verification'): void {
    switch (type) {
      case 'flyer':
        this.selectedFlyer = null;
        break;
      case 'banner':
        this.selectedBanner = null;
        break;
      case 'verification':
        this.selectedVerificationDocs = [];
        break;
    }
  }

  //Utility methods
  getCharacterCount(fieldName: string): number {
    return this.scholarshipForm.get(fieldName)?.value?.length || 0;
  }

  //Form Actions
  saveDraft(): void {
    const draftData = {
      ...this.scholarshipForm.value,
      fields_of_study: this.selectedFields,
      attachments: {
        flyer: this.selectedFlyer,
        banner: this.selectedBanner,
        verificationDocument: this.selectedVerificationDocs,
      },
      currentStep: this.currentStep,
      isDraft: true,
      saveAt: new Date(),
    };

    //save to local storage or send to API
    localStorage.setItem('scholarshipDraft', JSON.stringify(draftData));
    alert('Draft saved successfully!');
  }

  onSubmit(): void {
    if (this.scholarshipForm.invalid) {
      alert('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    // Append form fields safely
    Object.entries(this.scholarshipForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object' && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    });

    // Fields of study
    formData.append('fields_of_study', this.selectedFields.join(','));

    // Files
    if (this.selectedFlyer) {
      formData.append('flyer', this.selectedFlyer.file);
    }

    if (this.selectedBanner) {
      formData.append('banner', this.selectedBanner.file);
    }

    this.selectedVerificationDocs.forEach((doc) => {
      formData.append('verificationDocument', doc.file);
    });

    this.providerScholarshipService.createScholarship(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Scholarship posted successfully! Pending admin review.');

        localStorage.removeItem('scholarshipDraft');
        this.router.navigate(['/provider/manage']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        alert('Failed to post scholarship. Please try again.');
      },
    });
  }

  //load draft on component init (if exists)
  private loadDraft(): void {
    const draftData = localStorage.getItem('scholarshipDraft');
    if (draftData) {
      try {
        const draft = JSON.parse(draftData);
        if (
          confirm('You have a saved draft. Would you like to continue from where you left off?')
        ) {
          this.scholarshipForm.patchValue(draft);
          this.selectedFields = draft.fields_of_study || [];
          this.currentStep = draft.currentStep || 1;

          //note: file attachements cannot be restored from local storage
          //in a real app, we will need to store draft data server-side
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
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