import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SignupComponent } from './signup.component';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    userService = jasmine.createSpyObj('UserService', ['registerUser']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent, FormsModule], // Use imports instead of declarations
      providers: [{ provide: UserService, useValue: userService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should submit form with valid data', fakeAsync(() => {
    component.signupForm.setValue({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
    });
    userService.submitUser.and.returnValue(of(true));

    component.onSubmit();
    tick(3000);

    expect(notificationService.show).toHaveBeenCalledWith(
      'User registered successfully!',
      true
    );
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.signupForm.value).toEqual({
      first_name: '',
      last_name: '',
      email: '',
    }); // Check if form resets
  }));

  it('should show error message when form is invalid', () => {
    component.signupForm.setValue({ first_name: '', last_name: '', email: '' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Fill the form properly');
    expect(userService.submitUser).not.toHaveBeenCalled();
  });

  it('should handle registration errors', fakeAsync(() => {
    component.signupForm.setValue({
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane.doe@example.com',
    });
    userService.submitUser.and.returnValue(throwError('Error occurred!'));

    component.onSubmit();
    tick(3000);

    expect(notificationService.show).toHaveBeenCalledWith(
      'Error registering user!',
      false
    );
    expect(component.successMessage).toBe('');
  }));
});
