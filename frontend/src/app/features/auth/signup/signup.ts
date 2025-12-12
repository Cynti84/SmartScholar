import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface SignupFormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
  agreeToTerms: boolean;
}

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  showPassword: boolean = false;
  isLoading: boolean = false;

  formData: SignupFormData = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    role: '',
    agreeToTerms: false,
  };

  constructor(private router: Router, private authService: AuthService) {}

  /**
   * Toggle password visibility
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handle form submission
   */
  async onSubmit(): Promise<void> {
    if (this.isLoading) return;

    try {
      this.isLoading = true;

      // Validate form data
      if (!this.validateForm()) {
        this.isLoading = false;
        return;
      }

      // Prepare payload for backend
      const payload = {
        firstName: this.formData.firstname,
        lastName: this.formData.lastname,
        email: this.formData.email,
        password: this.formData.password,
        role: this.formData.role,
      };

      // Call backend signup API
      this.authService.signup(payload).subscribe({
        next: (response) => {
          console.log('Signup success:', response);

          // Move to next step (profile setup)
          this.handleSuccessfulSignup();
        },

        error: (error) => {
          console.error('Signup error:', error);
          console.error('Validation errors', error.error);
          this.handleSignupError(error);
        },
      });
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Validate form data
   */
  private validateForm(): boolean {
    // Check if first name is filled
    if (!this.formData.firstname.trim()) {
      this.showError('Please enter your first name');
      return false;
    }

    // Check if last name is filled
    if (!this.formData.lastname.trim()) {
      this.showError('Please enter your last name');
      return false;
    }

    if (!this.formData.email.trim()) {
      this.showError('Please enter your email address');
      return false;
    }

    if (!this.isValidEmail(this.formData.email)) {
      this.showError('Please enter a valid email address');
      return false;
    }

    if (!this.formData.password) {
      this.showError('Please create a password');
      return false;
    }

    if (this.formData.password.length < 8) {
      this.showError('Password must be at least 8 characters long');
      return false;
    }

    if (!this.formData.role) {
      this.showError('Please select your role');
      return false;
    }

    if (!this.formData.agreeToTerms) {
      this.showError('Please agree to the terms and conditions');
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
   * Handle successful signup
   */
  private handleSuccessfulSignup(): void {
    // Show success message
    this.showSuccess('Account created successfully! Please complete your profile setup.');

    const tempUserData = {
      firstname: this.formData.firstname,
      lastname: this.formData.lastname,
      fullname: `${this.formData.firstname} ${this.formData.lastname}`,
      email: this.formData.email,
      role: this.formData.role,
    };
    localStorage.setItem('tempUserData', JSON.stringify(tempUserData));

    // Clear form
    // this.resetForm();

    // Continue to role-specific signup page
    setTimeout(() => {
      this.continueToProfileSetup();
    }, 2000);
  }

  /**
   * Continue to role-specific profile setup page
   */
  private continueToProfileSetup(): void {
    if (!this.formData.role) {
      this.showError('No role selected. Please try again.');
      return;
    }

    const fullname = `${this.formData.firstname} ${this.formData.lastname}`;

    if (this.formData.role === 'student') {
      this.router.navigate(['/auth/signup/student'], {
        queryParams: {
          email: this.formData.email,
          firstname: this.formData.firstname,
          lastname: this.formData.lastname,
          fullname: fullname,
          step: 'profile-setup',
        },
      });
    } else if (this.formData.role === 'provider') {
      this.router.navigate(['/auth/signup/provider'], {
        queryParams: {
          email: this.formData.email,
          firstname: this.formData.firstname,
          lastname: this.formData.lastname,
          fullname: fullname,
          step: 'profile-setup',
        },
      });
    } else {
      //handle any other roles or fallback
      console.error('Invalid role selected:', this.formData.role);
      this.showError('Invalid role selected. Please try again');
    }
  }

  /**
   * Handle signup errors
   */
  private handleSignupError(error: any): void {
    let errorMessage = 'An error occurred during signup. Please try again.';

    // Handle specific error types
    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Handle common error scenarios
    if (errorMessage.includes('email') && errorMessage.includes('exists')) {
      errorMessage = 'An account with this email already exists. Please try logging in instead.';
    }

    this.showError(errorMessage);
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.formData = {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      role: '',
      agreeToTerms: false,
    };
    this.showPassword = false;
  }

  /**
   * Show error message (you can integrate with a toast service)
   */
  private showError(message: string): void {
    // For now, just log to console
    // In a real app, you'd show this in a toast notification
    console.error('Account Creation Error:', message);

    // You can integrate with popular toast libraries like:
    // - ngx-toastr
    // - ng-zorro-antd notifications
    // - Angular Material snackbar
    // Example: this.toastr.error(message, 'Account Creation Error');

    alert(message); // Temporary solution
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    // For now, just log to console
    // In a real app, you'd show this in a toast notification
    console.log('Account Creation Success:', message);

    // Example: this.toastr.success(message, 'Welcome to SmartScholar!');
    alert(message); // Temporary solution
  }

  /**
   * Utility function to create delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Handle social login (if needed in the future)
   */
  onSocialLogin(provider: 'google' | 'facebook' | 'apple'): void {
    console.log(`Social login with ${provider}`);
    // Implement social login logic here
  }

  /**
   * Get password strength indicator
   */
  getPasswordStrength(): string {
    const password = this.formData.password;
    if (!password) return '';

    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Complexity checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength < 3) return 'weak';
    if (strength < 5) return 'medium';
    return 'strong';
  }

  /**
   * Check if form has unsaved changes
   */
  hasUnsavedChanges(): boolean {
    return !!(
      this.formData.firstname ||
      this.formData.lastname ||
      this.formData.email ||
      this.formData.password ||
      this.formData.role ||
      this.formData.agreeToTerms
    );
  }
}
