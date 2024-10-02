import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FORM_ERROR_MESSAGES } from '../Enum/constants';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['login']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'show',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with two controls', () => {
    expect(component.loginForm.contains('email')).toBeTrue();
    expect(component.loginForm.contains('tempKey')).toBeTrue();
  });

  it('should require email control to be valid', () => {
    const control = component.loginForm.get('email');
    if (control) {
      control.setValue('');
      expect(control.valid).toBeFalse();
    }
  });

  it('should require tempKey control to be valid', () => {
    const control = component.loginForm.get('tempKey');
    if (control) {
      control.setValue('');
      expect(control.valid).toBeFalse();
    }
  });

  it('should call userService.login when form is valid and submitted', () => {
    component.loginForm.setValue({ email: 'test@gmail.com', tempKey: '12345' });
    userService.login.and.returnValue(of(true));

    component.onLogin();

    expect(userService.login).toHaveBeenCalledOnceWith('test@gmail.com', '12345');
  });

  it('should set isSubmitting to true when login is in progress', () => {
    component.loginForm.setValue({ email: 'test@gmail.com', tempKey: '12345' });
    userService.login.and.returnValue(of(true));

    component.onLogin();

    expect(component.isSubmitting).toBeTrue();
  });

  it('should navigate to admin-crud on successful login', fakeAsync(() => {
    component.loginForm.setValue({ email: 'test@gmail.com', tempKey: '12345' });
    userService.login.and.returnValue(of(true));

    component.onLogin();
    tick(3000);

    expect(notificationService.show).toHaveBeenCalledWith(
      'Login successful!',
      true
    );
    expect(router.navigate).toHaveBeenCalledWith(['/admin-crud']);
  }));

  it('should show error notification on invalid login', () => {
    component.loginForm.setValue({ email: 'test@gmail.com', tempKey: '12345' });
    userService.login.and.returnValue(of(false));

    component.onLogin();

    expect(notificationService.show).toHaveBeenCalledWith(
      'Invalid username or temporary key.',
      false
    );
  });

  it('should show error message when login fails', () => {
    component.loginForm.setValue({ email: 'test@gmail.com', tempKey: '12345' });
    userService.login.and.returnValue(throwError('error'));

    component.onLogin();

    expect(component.errorMessage).toBe(
      'An error occurred during login. Please try again later.'
    );
  });

  it('should show error message if form is invalid', () => {
    component.onLogin();
    expect(component.errorMessage).toBe(FORM_ERROR_MESSAGES.invalid_form);
  });
});
