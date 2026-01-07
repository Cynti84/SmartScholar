import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface ProviderProfileData{
  organizationName: string
  providerType: string
  country: string
  contactEmail: string
  phone: string;
  logoFile: File | null
  verificationDocument: File | null
}

@Component({
  selector: 'app-provider-signup',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './provider-signup.html',
  styleUrl: './provider-signup.scss',
})
export class ProviderSignup {
  isLoading: boolean = false;
  tempUserData: any = {};

  profileData: ProviderProfileData = {
    organizationName: '',
    providerType: '',
    country: '',
    contactEmail: '',
    phone: '',
    logoFile: null,
    verificationDocument: null,
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
    'South Africa',
    'Nigeria',
    'Ghana',
    'Egypt',
    'Morocco',
    'Algeria',
    'Tunisia',
    'Libya',
  ];

  providerTypes = [
    'NGO (Non-Governmental Organization)',
    'University/Educational Institution',
    'Private Company/Corporation',
    'Government Agency',
    'Foundation',
    'Religious Organization',
    'Community-Based Organization',
    'International Organization',
    'Research Institution',
    'Healthcare Organization',
  ];

  constructor(private router: Router) {}

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

      //Pre-fll contact email with the email from step 1 if not provided
      if (!this.profileData.contactEmail && this.tempUserData.email) {
        this.profileData.contactEmail = this.tempUserData.email;
      }
    } else {
      //if not temp data, redirect back to initial signup
      this.router.navigate(['/auth/signup']);
    }
  }

  /**
   * Handle file selection for logo
   */

  onLogoFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      //validate file type and size
      if (!file.type.startsWith('image/')) {
        this.showError('Please select a valid image file for the logo');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.showError('Logo file must be less than 5MB');
        return;
      }

      this.profileData.logoFile = file;
    }
  }

  /**
   * Handle file selection for verification document
   */

  onVerificationDocumentSelect(event: any): void {
    const file = event.target.files[0];

    if (file) {
      //validate file type and size
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg',
      ];

      if (!allowedTypes.includes(file.type)) {
        this.showError('Please select a PDF, Word document, or image file for verification');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        this.showError('Verification document must be less than 10MB');
        return;
      }

      this.profileData.verificationDocument = file;
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
    if (!this.profileData.organizationName.trim()) {
      this.showError('Please enter your organization name');
      return false;
    }

    if (!this.profileData.providerType) {
      this.showError('Please select your provider type');
      return false;
    }

    if (!this.profileData.country) {
      this.showError('Please select your country');
      return false;
    }

    if (!this.profileData.contactEmail.trim()) {
      this.showError('Please enter your contact email');
      return false;
    }

    if (!this.isValidEmail(this.profileData.contactEmail)) {
      this.showError('Please enter a valid email address');
      return false;
    }

    if (!this.profileData.phone.trim()) {
      this.showError('Please enter your phone number');
      return false;
    }

    if (!this.isValidPhone(this.profileData.phone)) {
      this.showError('Please enter a valid phone number');
      return false;
    }

    return true;
  }

  /**
   * Check if email is valid
   */

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if phone is valid(basic validation)
   */

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.trim());
  }

  /**
   * Handle form submission
   */

  async onSubmit(): Promise<void>{
    if (this.isLoading) return
    
    try {
      this.isLoading = true
      if (!this.validateForm()) {
        this.isLoading = false
        return
      }

      //simulate api call delay
      await this.delay(2000)

      //create FormData for file uploads
      const formData = new FormData()
      formData.append('organizationName', this.profileData.organizationName);
      formData.append('providerType', this.profileData.providerType);
      formData.append('country', this.profileData.country);
      formData.append('contactEmail', this.profileData.contactEmail);
      formData.append('phone', this.profileData.phone);

      if (this.profileData.logoFile) {
        formData.append('logoFile', this.profileData.logoFile);
      }

      if (this.profileData.verificationDocument) {
        formData.append('verificationDocument', this.profileData.verificationDocument);
      }

      //Hwere we will make the api call to complete provider signup

      console.log('Provider profile data:', {
        ...this.profileData, tempUserData: this.tempUserData

      })

      this.handleSuccessfulSignup()
      
    } catch (error) {

      console.error('Provider profile setup error:', error)
      this.handleSignupError(error)

      
    } finally {
      this.isLoading = false
            
    }
  }

  /**
   * Handle successful profile completion
   */

  private handleSuccessfulSignup(): void{
    this.showSuccess('Provider profile submitted successfully! Your account is under review')

    //clear temporary data
    localStorage.removeItem('tempUserData')

    //redirect to provider dashboard after a delay
    setTimeout(() => {
      this.router.navigate(['/provider'])
      
    }, 2000);
  }

  /**
   * Handle signup errors
   */

  private handleSignupError(error: any): void{
    let errorMessage = 'Failed to complete profile setup. Please try again'
    
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

  private showError(message: string): void{
    console.error('Provider Profile Error: ', message)
    alert(message) //I'll replace with toast notification in production
  }

  /**
   * Show success message
   */

  private showSuccess(message: string): void{
    console.log('Provider profile success:', message)
    alert(message) //I'll replace with toast notification in production as well

  }

  /**
   * Utility delay function
   */

  private delay(ms: number): Promise<void>{
    return new Promise(resolve => setTimeout(resolve, ms))
    
  }

  /**
   * Get file name for display
   */

  getFileName(file: File | null): string{
    return file ? file.name : ''
    
  }

  /**
   * Remove selected file
   */

  removeFile(type: 'logo' | 'verification'): void{
    if (type === 'logo') {
      this.profileData.logoFile = null
      
    } else {
      this.profileData.verificationDocument = null
      
    }
  }

  /**
   * format phone number as user types (optional enhancement)
   */

  onPhoneInput(event: any): void{
    let value = event.target.value.replace;

    // Add formatting for common phone number patterns
    if (value.length > 0) {
      if (value.startsWith('254')) {
        // Kenya country code
        value = value.replace(/^254/, '+254 ');
        if (value.length > 8) {
          value = value.replace(/(\+254 \d{3})(\d{3})(\d{3})/, '$1 $2 $3');
        }
      } else if (value.startsWith('0')) {
        // Local format
        value = value.replace(/^0/, '0');
        if (value.length > 4) {
          value = value.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
        }
      }
    }

    this.profileData.phone = value;
  }

}
