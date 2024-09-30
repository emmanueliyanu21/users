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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder
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
          if (success) {
            this.successMessage = 'Login successful!';
            setTimeout(() => {
              this.router.navigate(['/admin-crud']);
            }, 3000);
          } else {
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
