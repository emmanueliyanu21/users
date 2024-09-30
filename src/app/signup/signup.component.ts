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
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, HttpClientModule],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  signupForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService
  ) {
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
          this.errorMessage = '';
          if (response) {
            setTimeout(() => {
              this.isSubmitting = false;
              this.signupForm.reset();
              this.notificationService.show(
                'User registered successfully!',
                true
              );
              this.router.navigate(['/login']);
            }, 3000);
          }
        },
        error: (error) => {
          this.notificationService.show('Error registering user!', false);
          this.successMessage = '';
          this.isSubmitting = false;
        },
      });
    } else {
      this.errorMessage = 'Fill the form properly';
    }
  }
}
