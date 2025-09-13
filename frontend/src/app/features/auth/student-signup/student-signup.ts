import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface StudentProfileData {
  country: string;
  educationLevel: string;
  fieldOfStudy: string;
  interest: string;
  profileImage: File | null;
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

  profileData: StudentProfileData = {
    country: '',
    educationLevel: '',
    fieldOfStudy: '',
    interest: '',
    profileImage: null,
    cvFile: null,
  };

  countries = [
    'Kenya',
    'Uganda',
    'Tanzania',
    'Rwanda',
    'Burundi',
    'South Sudan',
    'Ethiopia',
    'Somalia',
    'Djibouti',
    'Eritrea',
  ];

  educationLevels = [
    'High school student',
    'High school graduate',
    'Undergraduate student',
    'Graduate student',
    'Postgraduate student',
  ];

  fieldsOfStudy = [
    'Engineering',
    'Medicine',
    'Computer Science',
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
    'Science',
    'Technology',
    'Arts',
    'Sports',
    'Music',
    'Literature',
    'Environment',
    'Community Service',
    'Research',
    'Innovation',
    'Leadership',
    'Entrepreneurship',
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadTempUserData();
  }

  /**
   * Load temporary user data from session/local storage
   */
  loadTempUserData(): void {
    // In a real app, you'd get this from your auth service
    // For now, we'll simulate getting data from the previous step
    const tempData = localStorage.getItem('tempUserData');
    if (tempData) {
      this.tempUserData = JSON.parse(tempData);
    } else {
      // If no temp data, redirect back to initial signup
      this.router.navigate(['/auth/signup']);
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

      this.profileData.profileImage = file;
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

    if (!this.profileData.educationLevel) {
      this.showError('Please select your education level');
      return false;
    }

    if (!this.profileData.fieldOfStudy) {
      this.showError('Please select your field of study');
      return false;
    }

    if (!this.profileData.interest) {
      this.showError('Please select your interest');
      return false;
    }

    return true;
  }

  /**
   * Handle form submission
   */
  async onSubmit(): Promise<void> {
    if (this.isLoading) return;

    try {
      this.isLoading = true;

      if (!this.validateForm()) {
        this.isLoading = false;
        return;
      }

      // Simulate API call delay
      await this.delay(2000);

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('country', this.profileData.country);
      formData.append('educationLevel', this.profileData.educationLevel);
      formData.append('fieldOfStudy', this.profileData.fieldOfStudy);
      formData.append('interest', this.profileData.interest);

      if (this.profileData.profileImage) {
        formData.append('profileImage', this.profileData.profileImage);
      }

      if (this.profileData.cvFile) {
        formData.append('cvFile', this.profileData.cvFile);
      }

      // Here you would make the API call to complete student signup
      console.log('Student profile data:', {
        ...this.profileData,
        tempUserData: this.tempUserData,
      });

      this.handleSuccessfulSignup();
    } catch (error) {
      console.error('Student profile setup error:', error);
      this.handleSignupError(error);
    } finally {
      this.isLoading = false;
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
      this.profileData.profileImage = null;
    } else {
      this.profileData.cvFile = null;
    }
  }
}
