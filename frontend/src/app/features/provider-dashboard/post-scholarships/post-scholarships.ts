import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../../shared/layouts/dashboard-layout/dashboard-layout';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface FileUpload {
  name: string;
  size: number;
  type: string;
  file: File;
}
@Component({
  selector: 'app-post-scholarships',
  imports: [CommonModule, DashboardLayout, ReactiveFormsModule],
  templateUrl: './post-scholarships.html',
  styleUrl: './post-scholarships.scss',
})
export class PostScholarships implements OnInit {

  isDarkMode = false
  

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

  constructor(private fb: FormBuilder, private router: Router, private renderer: Renderer2) {
    //set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.scholarshipForm = this.fb.group({
      //step 1: Basic information
      title: ['', [Validators.required, Validators.minLength(10)]],
      organizationName: ['', [Validators.required]],
      shortSummary: ['', [Validators.required, Validators.maxLength(200)]],

      //step 2: Description and Details
      fullDescription: ['', [Validators.required, Validators.minLength(50)]],
      eligibilityCriteria: ['', [Validators.required]],
      benefits: ['', [Validators.required]],
      applicationDeadline: ['', [Validators.required, this.futureDateValidator]],

      //Step 3: Categorization and scope
      country: ['', [Validators.required]],
      educationLevel: ['', [Validators.required]],
      scholarshipType: ['', [Validators.required]],
      fieldsOfStudy: ['', [Validators.required]],

      //Step 4: application  information
      applicationLink: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      applicationInstructions: ['', [Validators.required]],
      contactEmail: ['', [Validators.email]],
      contactPhone: [''],

      //step 5: final
      adminNotes: [''],
    });

    //Auto-fill organization name from user profile (if available)
    this.scholarshipForm.patchValue({
      organizationName: 'Your Organization Name', //replace with actual user data
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
          (this.scholarshipForm.get('organizationName')?.valid ?? false) &&
          (this.scholarshipForm.get('shortSummary')?.valid ?? false)
        );
      case 2:
        return (
          (this.scholarshipForm.get('fullDescription')?.valid ?? false) &&
          (this.scholarshipForm.get('eligibilityCriteria')?.valid ?? false) &&
          (this.scholarshipForm.get('benefits')?.valid ?? false) &&
          (this.scholarshipForm.get('applicationDeadline')?.valid ?? false)
        );
      case 3:
        return (
          (this.scholarshipForm.get('country')?.valid ?? false) &&
          (this.scholarshipForm.get('educationLevel')?.valid ?? false) &&
          (this.scholarshipForm.get('scholarshipType')?.valid ?? false) &&
          this.selectedFields.length > 0
        );
      case 4:
        return (
          (this.scholarshipForm.get('applicationLink')?.valid ?? false) &&
          (this.scholarshipForm.get('applicationInstructions')?.valid ?? false)
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
        fieldsOfStudy: this.selectedFields.join(','),
      });
    }
  }

  removeField(field: string): void {
    this.selectedFields = this.selectedFields.filter((f) => f !== field);
    this.scholarshipForm.patchValue({
      fieldsOfStudy: this.selectedFields.join(','),
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
      fieldsOfStudy: this.selectedFields,
      attachments: {
        flyer: this.selectedFlyer,
        banner: this.selectedBanner,
        verificationDocs: this.selectedVerificationDocs,
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
    if (!this.scholarshipForm.valid) {
      alert('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;

    //prepare form data
    const formData = new FormData();

    // Add form fields
    Object.keys(this.scholarshipForm.value).forEach((key) => {
      if (this.scholarshipForm.value[key]) {
        formData.append(key, this.scholarshipForm.value[key]);
      }
    });

    //add selected fields
    formData.append('fieldsOfStudy', JSON.stringify(this.selectedFields));

    //Add files
    if (this.selectedFlyer) {
      formData.append('flyer', this.selectedFlyer.file);
    }
    if (this.selectedBanner) {
      formData.append('banner', this.selectedBanner.file);
    }
    this.selectedVerificationDocs.forEach((doc, index) => {
      formData.append(`verificationDoc_${index}`, doc.file);
    });

    //simulate api call
    setTimeout(() => {
      this.isSubmitting = false;
      alert('Scholarship posted successfully! It will be reviewed by our admin team.');

      //clear draft
      localStorage.removeItem('scholarshipDraft');

      //navigate to dashboard or manage scholarship
      this.router.navigate(['/provider/manage']);
    }, 2000);
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
          this.selectedFields = draft.fieldsOfStudy || [];
          this.currentStep = draft.currentStep || 1;

          //note: file attachements cannot be restored from local storage
          //in a real app, we will need to store draft data server-side
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }

}