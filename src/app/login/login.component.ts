import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;
  showTempKey: boolean = false;

  icons = {
    eyeOpen: './../assets/icons/eye.svg',
    eyeSlash: './../assets/icons/eye-off.svg',
  };

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      tempKey: ['', Validators.required],
    });
  }

  ngOnInit() {}

  get email() {
    return this.loginForm.get('email');
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, tempKey } = this.loginForm.value;
      this.userService.login(email, tempKey).subscribe({
        next: (success) => {
          this.isSubmitting = true;
          this.errorMessage = '';
          if (success) {
            setTimeout(() => {
              this.isSubmitting = false;
              this.notificationService.show('Login successful!', true);
              this.router.navigate(['/admin-crud']);
            }, 2000);
          } else {
            this.isSubmitting = false;
            this.notificationService.show(
              'Invalid username or temporary key.',
              false
            );
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

  toggleTempKey() {
    this.showTempKey = !this.showTempKey;
  }
}
