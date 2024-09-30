import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, HttpClientModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      first_name: ['', Validators.required],
      tempKey: ['', Validators.required],
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { first_name, tempKey } = this.loginForm.value;
      this.userService.login(first_name, tempKey).subscribe({
        next: (success) => {
          this.isSubmitting = true;
          this.errorMessage = '';
          if (success) {
            setTimeout(() => {
              this.isSubmitting = false;
              this.notificationService.showSuccess('Login successful!');
              this.router.navigate(['/admin-crud']);
            }, 3000);
            
          } else {
            this.isSubmitting = false;
            this.errorMessage = 'Invalid username or temporary key.';
          }
        },
        error: (error) => {
          this.errorMessage =
            'An error occurred during login. Please try again later.';
        },
      });
    } else {
      this.errorMessage = 'Please fill in all fields correctly.';
    }
  }
}
