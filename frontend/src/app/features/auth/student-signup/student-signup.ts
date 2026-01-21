import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { StudentProfileService, StudentProfile } from '../../../core/services/studentProfile';
interface StudentSignupForm {
  country: string;
  academic_level: string;
  field_of_study: string;
  interest: string;

  date_of_birth: string; // HTML date input = string
  gender: 'male' | 'female' | 'other';
  income_level?: 'low' | 'middle' | 'any';
  is_disabled?: boolean | null;

  profileImageFile: File | null;
  cvFile: File | null;
}

@Component({
  selector: 'app-student-signup',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './student-signup.html',
  styleUrl: './student-signup.scss',
})
export class StudentSignup {
  isLoading: boolean = false;
  tempUserData: any = {};

  profileData: StudentSignupForm = {
    country: '',
    academic_level: '',
    field_of_study: '',
    interest: '',

    date_of_birth: '',
    gender: 'male',
    income_level: 'any',

    profileImageFile: null,
    cvFile: null,
  };

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

  constructor(
    private router: Router,
    private studentProfileService: StudentProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTempUserData();
  }

  /**
   * Load temporary user data from session/local storage
   */
  loadTempUserData(): void {
    const tempData = localStorage.getItem('tempUserData');

    if (tempData) {
      this.tempUserData = JSON.parse(tempData);
    } else {
      // fallback to authenticated user
      const user = this.authService.getUserFromToken();
      if (!user) {
        this.router.navigate(['/auth/signup']);
      }
    }
  }

  /**
   * Handle file selection for profile image
   */
  onProfileImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        this.showError('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        this.showError('Profile image must be less than 5MB');
        return;
      }

      this.profileData.profileImageFile = file;
    }
  }

  /**
   * Handle file selection for CV
   */
  onCvFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(file.type)) {
        this.showError('Please select a PDF or Word document for your CV');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        this.showError('CV file must be less than 10MB');
        return;
      }

      this.profileData.cvFile = file;
    }
  }

  /**
   * Trigger file input click
   */
  triggerFileInput(inputId: string): void {
    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Validate form data
   */
  private validateForm(): boolean {
    if (!this.profileData.country) {
      this.showError('Please select your country');
      return false;
    }

    if (!this.profileData.academic_level) {
      this.showError('Please select your education level');
      return false;
    }

    if (!this.profileData.field_of_study) {
      this.showError('Please select your field of study');
      return false;
    }

    if (!this.profileData.interest) {
      this.showError('Please select your interest');
      return false;
    }

    if (!this.profileData.date_of_birth) {
      this.showError('Please enter your date of birth');
      return false;
    }

    if (!this.profileData.gender) {
      this.showError('Please select your gender');
      return false;
    }

    return true;
  }

  /**
   * Handle form submission
   */
  async onSubmit(): Promise<void> {
    if (this.isLoading) return;
    if (!this.validateForm()) return;

    this.isLoading = true;

    try {
      const formData = new FormData();

      // --- Text fields ---
      formData.append('country', this.profileData.country);
      formData.append('academic_level', this.profileData.academic_level);
      formData.append('field_of_study', this.profileData.field_of_study);
      if (this.profileData.interest) formData.append('interest', this.profileData.interest);

      if (this.profileData.date_of_birth) {
        // Convert Date object to string yyyy-mm-dd for backend
        const dobStr = this.profileData.date_of_birth.toString().split('T')[0];
        formData.append('date_of_birth', dobStr);
      }

      if (this.profileData.income_level) {
        formData.append('income_level', this.profileData.income_level);
      }

      if (this.profileData.is_disabled !== null && this.profileData.is_disabled !== undefined) {
        formData.append('is_disabled', String(this.profileData.is_disabled));
      }

      // --- Files ---
      if (this.profileData.profileImageFile instanceof File) {
        formData.append('profileImage', this.profileData.profileImageFile);
      }

      if (this.profileData.cvFile instanceof File) {
        formData.append('cvFile', this.profileData.cvFile);
      }

      // --- Send to backend ---
      this.studentProfileService.createProfile(formData).subscribe({
        next: () => {
          this.showSuccess('Profile completed successfully! Welcome to SmartScholar 🎉');

          localStorage.removeItem('tempUserData');

          setTimeout(() => {
            this.router.navigate(['/student']);
          }, 1000);
        },
        error: (err) => {
          this.handleSignupError(err);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    } catch (error) {
      this.isLoading = false;
      this.showError('An unexpected error occurred while submitting your profile.');
      console.error(error);
    }
  }

  /**
   * Handle successful profile completion
   */
  private handleSuccessfulSignup(): void {
    this.showSuccess('Profile completed successfully! Welcome to SmartScholar!');

    // Clear temporary data
    localStorage.removeItem('tempUserData');

    // Redirect to student dashboard after delay
    setTimeout(() => {
      this.router.navigate(['/student']);
    }, 2000);
  }

  /**
   * Handle signup errors
   */
  private handleSignupError(error: any): void {
    let errorMessage = 'Failed to complete profile setup. Please try again.';

    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    this.showError(errorMessage);
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    console.error('Student Profile Error:', message);
    alert(message); // Replace with toast notification in production
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    console.log('Student Profile Success:', message);
    alert(message); // Replace with toast notification in production
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get file name for display
   */
  getFileName(file: File | null): string {
    return file ? file.name : '';
  }

  /**
   * Remove selected file
   */
  removeFile(type: 'profile' | 'cv'): void {
    if (type === 'profile') {
      this.profileData.profileImageFile = null;
    } else {
      this.profileData.cvFile = null;
    }
  }
}
