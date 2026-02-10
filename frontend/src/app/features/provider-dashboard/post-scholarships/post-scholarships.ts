import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NavItem } from '../../../shared/components/sidebar/sidebar';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { ProviderService } from '../../../core/services/provider.service';
import { MatIconModule } from '@angular/material/icon';
import {
  PostingAssistantService,
  CompletenessAnalysis,
  PolishTextResponse,
} from '../../../core/services/posting-assistance.service';

interface FileUpload {
  name: string;
  size: number;
  type: string;
  file: File;
}
@Component({
  selector: 'app-post-scholarships',
  imports: [CommonModule, DashboardLayout, ReactiveFormsModule, ConfirmModal, MatIconModule],
  templateUrl: './post-scholarships.html',
  styleUrl: './post-scholarships.scss',
})
export class PostScholarships implements OnInit, OnDestroy {
  isDarkMode = false;

  scholarshipForm!: FormGroup;
  currentStep = 1;
  maxStep = 6;
  isSubmitting = false;
  minDate: string;
  genders = ['any', 'male', 'female'];
  incomeLevels = ['low', 'middle', 'any'];
  //menu for navigation

  selectedFields: string[] = [];

  //file upload properties
  selectedFlyer: FileUpload | null = null;
  selectedBanner: FileUpload | null = null;
  selectedVerificationDocs: FileUpload[] = [];

  // step 4 tag selections
  selectedEligibilityCountries: string[] = [];

  // AI Assistant State
  completenessAnalysis: CompletenessAnalysis | null = null;
  polishingField: string | null = null;
  generatingField: string | null = null;
  showCompletenessWidget = true;

  // Polish text comparison
  polishComparison: {
    show: boolean;
    field: string;
    original: string;
    polished: string;
    improvements: string[];
  } | null = null;

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
    'Talent-based',
    'Project-based',
    'Contribution-based',
    'Gender-based',
  ];

  fieldsOfStudy = [
    'Accounting',
    'Agriculture',
    'Animation',
    'Anthropology',
    'Architecture',
    'Aerospace Engineering',
    'Artificial Intelligence',
    'Art',
    'Astronomy',
    'Automation',
    'Biology',
    'Biomedical Engineering',
    'Blockchain',
    'Business',
    'Business Administration',
    'Chemical Engineering',
    'Chemistry',
    'Civil Engineering',
    'Cloud Computing',
    'Communications',
    'Computer Engineering',
    'Computer Science',
    'Cybersecurity',
    'Data Science',
    'Dentistry',
    'Design',
    'Economics',
    'Education',
    'Electrical Engineering',
    'Engineering',
    'Environmental Engineering',
    'Environmental Science',
    'Fashion Design',
    'Film Studies',
    'Finance',
    'Fintech',
    'Geography',
    'Geology',
    'Graphic Design',
    'History',
    'Information Technology',
    'International Relations',
    'IoT',
    'Journalism',
    'Law',
    'Linguistics',
    'Literature',
    'Machine Learning',
    'Management',
    'Marketing',
    'Mathematics',
    'Mechanical Engineering',
    'Media Studies',
    'Medicine',
    'Mobile Development',
    'Music',
    'Nursing',
    'Pharmacy',
    'Philosophy',
    'Physics',
    'Political Science',
    'Psychology',
    'Public Health',
    'Public Policy',
    'Renewable Energy',
    'Robotics',
    'Science',
    'Social Work',
    'Sociology',
    'Software Engineering',
    'Sports',
    'Statistics',
    'Technology',
    'Theatre',
    'Theology',
    'UI/UX Design',
    'Urban Planning',
    'Veterinary Science',
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private providerScholarshipService: ProviderService,
    private postingAssistant: PostingAssistantService // ← ADD THIS
  ) {
    //set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadDraft();
    // analyze on load
    setTimeout(() => {
      this.analyzeFormCompleteness();
    }, 500);
    this.scholarshipForm.valueChanges.subscribe(() => {
      // Debounce analysis
      if (this.analysisTimeout) {
        clearTimeout(this.analysisTimeout);
      }
      this.analysisTimeout = setTimeout(() => {
        this.analyzeFormCompleteness();
      }, 1000);
    });
  }
  private analysisTimeout: any;

  private initializeForm(): void {
    this.scholarshipForm = this.fb.group({
      // Step 1
      title: ['', [Validators.required, Validators.minLength(10)]],
      organization_name: ['', [Validators.required]],
      short_summary: ['', [Validators.required, Validators.maxLength(200)]],

      // Step 2
      country: ['', [Validators.required]],
      education_level: ['', [Validators.required]],
      scholarship_type: ['', [Validators.required]],
      fields_of_study: ['', [Validators.required]],
      min_gpa: [null],

      // Step 3
      description: ['', [Validators.required, Validators.minLength(50)]],
      eligibility_criteria: ['', [Validators.required]],
      benefits: ['', [Validators.required]],
      deadline: ['', [Validators.required, this.futureDateValidator]],

      // Step 4: Enhanced Eligibility and demographics
      min_age: [null, [Validators.min(0)]],
      max_age: [null, [Validators.min(0)]],
      eligibility_gender: ['any'], // default to any
      requires_disability: [false], //default to false
      income_level: ['any'], //default to any
      eligibility_countries: [''],

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
      organization_name: '', //replace with actual user data
    });
  }

  // Country methods
  addEligibilityCountry(country: string) {
    if (!this.selectedEligibilityCountries.includes(country)) {
      this.selectedEligibilityCountries.push(country);
      this.scholarshipForm.patchValue({
        eligibility_countries: this.selectedEligibilityCountries.join(','),
      });
    }
  }

  removeEligibilityCountry(country: string) {
    this.selectedEligibilityCountries = this.selectedEligibilityCountries.filter(
      (c) => c !== country
    );
    this.scholarshipForm.patchValue({
      eligibility_countries: this.selectedEligibilityCountries.join(','),
    });
  }

  getAvailableEligibilityCountries() {
    return this.countries.filter((c) => !this.selectedEligibilityCountries.includes(c));
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
      this.analyzeFormCompleteness(); // ← ADD THIS
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.analyzeFormCompleteness(); // ← ADD THIS
    }
  }

  ngOnDestroy(): void {
    if (this.analysisTimeout) {
      clearTimeout(this.analysisTimeout);
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
          (this.scholarshipForm.get('country')?.valid ?? false) &&
          (this.scholarshipForm.get('education_level')?.valid ?? false) &&
          (this.scholarshipForm.get('scholarship_type')?.valid ?? false) &&
          this.selectedFields.length > 0
        );
      case 3:
        return (
          (this.scholarshipForm.get('description')?.valid ?? false) &&
          (this.scholarshipForm.get('eligibility_criteria')?.valid ?? false) &&
          (this.scholarshipForm.get('benefits')?.valid ?? false) &&
          (this.scholarshipForm.get('deadline')?.valid ?? false)
        );
      case 4:
        return true;
      case 5:
        return (
          (this.scholarshipForm.get('application_link')?.valid ?? false) &&
          (this.scholarshipForm.get('application_instructions')?.valid ?? false)
        );
      case 6:
        return true; // Step 5 has no required fields

      default:
        return false;
    }
  }

  private gpaRangeValidator(group: FormGroup) {
    const min = group.get('min_gpa')?.value;
    const max = group.get('max_gpa')?.value;

    if (min !== null && max !== null && max < min) {
      return { invalidGpaRange: true };
    }
    return null;
  }

  /**
   * Analyze form completeness
   */
  analyzeFormCompleteness(): void {
    const formData = {
      ...this.scholarshipForm.value,
      fields_of_study: this.selectedFields,
      eligibility_countries: this.selectedEligibilityCountries,
      has_flyer: !!this.selectedFlyer,
      has_banner: !!this.selectedBanner,
      has_verification_docs: this.selectedVerificationDocs.length > 0,
    };

    this.postingAssistant.analyzeCompleteness(formData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.completenessAnalysis = response.data;
        }
      },
      error: (err) => {
        console.error('Completeness analysis error:', err);
      },
    });
  }

  /**
   * Get completeness score class
   */
  getScoreClass(): string {
    if (!this.completenessAnalysis) return '';
    return this.postingAssistant.getScoreClass(this.completenessAnalysis.score);
  }

  /**
   * Get importance class for missing fields
   */
  getImportanceClass(importance: 'critical' | 'recommended' | 'optional'): string {
    return this.postingAssistant.getImportanceClass(importance);
  }

  /**
   * Polish text with AI
   */
  polishText(
    fieldName: string,
    fieldType: 'title' | 'description' | 'eligibility' | 'benefits' | 'instructions' | 'summary'
  ): void {
    const currentValue = this.scholarshipForm.get(fieldName)?.value;

    if (!currentValue || currentValue.trim().length === 0) {
      alert('Please enter some text first before polishing');
      return;
    }

    this.polishingField = fieldName;

    const context = {
      scholarshipType: this.scholarshipForm.get('scholarship_type')?.value,
      educationLevel: this.scholarshipForm.get('education_level')?.value,
      fieldsOfStudy: this.selectedFields,
    };

    this.postingAssistant.polishText(currentValue, fieldType, context).subscribe({
      next: (response) => {
        this.polishingField = null;

        if (response.success && response.data) {
          this.polishComparison = {
            show: true,
            field: fieldName,
            original: response.data.originalText,
            polished: response.data.polishedText,
            improvements: response.data.improvements,
          };
        }
      },
      error: (err) => {
        console.error('Polish text error:', err);
        this.polishingField = null;
        alert('Failed to polish text. Please try again.');
      },
    });
  }

  /**
   * Accept polished text
   */
  acceptPolishedText(): void {
    if (this.polishComparison) {
      this.scholarshipForm.patchValue({
        [this.polishComparison.field]: this.polishComparison.polished,
      });
      this.polishComparison = null;
      // Re-analyze completeness
      this.analyzeFormCompleteness();
    }
  }

  /**
   * Reject polished text
   */
  rejectPolishedText(): void {
    this.polishComparison = null;
  }

  /**
   * Generate AI suggestion for field
   */
  generateSuggestion(
    fieldName: string,
    fieldType: 'eligibility' | 'benefits' | 'instructions'
  ): void {
    const scholarshipType = this.scholarshipForm.get('scholarship_type')?.value;
    const educationLevel = this.scholarshipForm.get('education_level')?.value;

    if (!scholarshipType || !educationLevel) {
      alert('Please select scholarship type and education level first');
      return;
    }

    this.generatingField = fieldName;

    const context = {
      scholarshipType,
      educationLevel,
      fieldsOfStudy: this.selectedFields,
      country: this.scholarshipForm.get('country')?.value,
    };

    this.postingAssistant.generateSuggestion(fieldType, context).subscribe({
      next: (response) => {
        this.generatingField = null;

        if (response.success && response.data) {
          const currentValue = this.scholarshipForm.get(fieldName)?.value || '';

          // If field is empty, use template directly
          if (currentValue.trim().length === 0) {
            this.scholarshipForm.patchValue({
              [fieldName]: response.data.template,
            });
          } else {
            // Show as suggestion if field already has content
            const useTemplate = confirm(
              'Field already has content. Replace with AI-generated template?\n\n' +
                'Click OK to replace, Cancel to keep current content.'
            );

            if (useTemplate) {
              this.scholarshipForm.patchValue({
                [fieldName]: response.data.template,
              });
            }
          }

          // Re-analyze completeness
          this.analyzeFormCompleteness();
        }
      },
      error: (err) => {
        console.error('Generate suggestion error:', err);
        this.generatingField = null;
        alert('Failed to generate suggestion. Please try again.');
      },
    });
  }

  /**
   * Check if field is being polished
   */
  isPolishing(fieldName: string): boolean {
    return this.polishingField === fieldName;
  }

  /**
   * Check if field is generating
   */
  isGenerating(fieldName: string): boolean {
    return this.generatingField === fieldName;
  }

  /**
   * Toggle completeness widget visibility
   */
  toggleCompletenessWidget(): void {
    this.showCompletenessWidget = !this.showCompletenessWidget;
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
      eligibility_countries: this.selectedEligibilityCountries,
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

    // eligibility countries
    formData.append('eligibility_countries', this.selectedEligibilityCountries.join(','));

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
