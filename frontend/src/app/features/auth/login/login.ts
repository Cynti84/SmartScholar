import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service'; // adjust path if needed

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

  constructor(private router: Router, private auth: AuthService) {}

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

    // Redirect based on role
    switch (user.role) {
      case 'student':
        this.router.navigate(['/student'])
          .then(success => console.log("Navigation success: ", success))
          .catch(err => console.error("Navigation error: ", err));
        break;

      case 'provider':
        this.router
          .navigate(['/provider'])
          .then((success) => console.log('Navigation success: ', success))
          .catch((err) => console.error('Navigation error: ', err));;
        break;

      case 'admin':
        this.router
          .navigate(['/admin'])
          .then((success) => console.log('Navigation success: ', success))
          .catch((err) => console.error('Navigation error: ', err));
        break;

      default:
        this.router.navigate(['/']);
        break;
    }

    // this.resetForm()
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
