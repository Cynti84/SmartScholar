import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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
  formData: LoginFormData = { email: '', password: '' };

  constructor(private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    if (!this.validateForm()) {
      this.isLoading = false;
      return;
    }

    try {
      // simulate backend request
      await this.delay(2000);

      // mock login check (replace with API call)
      if (this.formData.email === 'test@example.com' && this.formData.password === 'password123') {
        this.handleSuccessfulLogin();
      } else {
        this.showError('Invalid email or password');
      }
    } catch (err) {
      this.showError('An error occurred during login. Please try again.');
    } finally {
      this.isLoading = false;
    }
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private handleSuccessfulLogin(): void {
    this.showSuccess('Logged in successfully!');
    this.resetForm();
    setTimeout(() => this.router.navigate(['/dashboard']), 1000);
  }

  private resetForm(): void {
    this.formData = { email: '', password: '' };
    this.showPassword = false;
  }

  private showError(message: string): void {
    alert(message);
    console.error('Login error:', message);
  }

  private showSuccess(message: string): void {
    alert(message);
    console.log('Login success:', message);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }
}
