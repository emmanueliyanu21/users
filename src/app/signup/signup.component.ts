import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { UserService } from '../services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, HttpClientModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  signupForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.signupForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isSubmitting = true; 

      this.userService.submitUser(this.signupForm.value).subscribe({
        next: (response) => {
          this.successMessage = 'User registered successfully!';
          this.errorMessage = '';
          this.signupForm.reset();
          this.isSubmitting = false; 

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'Error registering user!';
          this.successMessage = '';
          this.isSubmitting = false; 
        },
      });
    }
  }
}
