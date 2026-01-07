import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service'; // adjust path if needed
import { ProviderService } from '../../../core/services/provider.service';
import { StudentService } from '../../../core/services/student.service';

interface LoginFormData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  showPassword = false;
  isLoading = false;

  formData: LoginFormData = {
    email: '',
    password: '',
  };

  constructor(
    private router: Router,
    private auth: AuthService,
    private providerAuth: ProviderService,
    private studentAuth: StudentService
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;

    if (!this.validateForm()) {
      this.isLoading = false;
      return;
    }

    // Prepare payload
    const loginPayload = {
      email: this.formData.email,
      password: this.formData.password,
    };

    this.auth.login(loginPayload).subscribe({
      next: (res) => {
        this.handleSuccessfulLogin(res.data.user);
      },

      error: (err) => {
        console.error('Login failed:', err);

        let msg = 'Login failed. Please try again.';
        if (err?.error?.message) msg = err.error.message;

        // common errors
        if (msg.toLowerCase().includes('invalid')) {
          msg = 'Invalid email or password.';
        }

        this.showError(msg);
      },

      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private validateForm(): boolean {
    if (!this.formData.email.trim()) {
      this.showError('Please enter your email address');
      return false;
    }

    if (!this.isValidEmail(this.formData.email)) {
      this.showError('Please enter a valid email address');
      return false;
    }

    if (!this.formData.password) {
      this.showError('Please enter your password');
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private handleSuccessfulLogin(user: any): void {
    this.showSuccess('Logged in successfully!');

    if (user.role === 'provider') {
      this.providerAuth.getProvider().subscribe({
        next: (profile) => {
          // Provider profile exists → dashboard
          this.router.navigate(['/provider']);
        },
        error: () => {
          // No provider profile yet → onboarding
          this.router.navigate(['/auth/signup/provider']);
        },
      });
      return;
    }

    if (user.role === 'student') {
      this.studentAuth.getProfile().subscribe({
        next: () => {
          // student profile exists -> dashboard
          this.router.navigate(['/student']);
        },
        error: () => {
          // No student profile -> onboarding
          this.router.navigate(['/auth/signup/student'])
        }
      });
      return;
    }

    if (user.role === 'admin') {
      this.router.navigate(['/admin']);
      return;
    }

    this.router.navigate(['/']);
  }

  private resetForm(): void {
    this.formData = { email: '', password: '' };
    this.showPassword = false;
  }

  private showError(message: string): void {
    alert(message); // replace later with ToastService
  }

  private showSuccess(message: string): void {
    alert(message);
  }
}
