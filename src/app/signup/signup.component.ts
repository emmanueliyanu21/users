import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
import { UserService } from '../services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { selectAllUsers } from '../store/user.selector';
import { Store } from '@ngrx/store';
import { AppState, User } from '../store/user';
import * as UserActions from '../store/user.action';

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

  users!: User[]
  users$ = this.store.select(selectAllUsers);

  private usersSubscription!: Subscription;
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService,
    private store: Store<AppState>
  ) {
    this.signupForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    this.store.dispatch(UserActions.loadUsers());

    this.usersSubscription = this.users$.subscribe(users => {
      this.users = users
    });

  }

  get email() {
    return this.signupForm.get('email');
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }

    const newUserEmail = this.signupForm.value.email;

    const emailExists = this.users.some((user) => user.email === newUserEmail);

    if (emailExists) {
      this.errorMessage = 'User with this email already exists';
      return; 
    }

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
            }, 1000);
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

  ngOnDestroy() {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

}
