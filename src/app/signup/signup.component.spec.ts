import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Store } from '@ngrx/store'; // import Store
import { of, throwError } from 'rxjs'; // you'll need to mock store observables
import { SignupComponent } from './signup.component';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FORM_ERROR_MESSAGES } from '../Enum/constants';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;
  let store: jasmine.SpyObj<Store>; // mock store

  beforeEach(async () => {
    userService = jasmine.createSpyObj('UserService', ['submitUser']);
    notificationService = jasmine.createSpyObj('NotificationService', ['show']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    store = jasmine.createSpyObj('Store', ['select', 'dispatch']); // mock store methods

    // Make store.select return a mock observable (e.g., of([]) for the users)
    store.select.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [SignupComponent, FormsModule],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: NotificationService, useValue: notificationService },
        { provide: Router, useValue: router },
        { provide: Store, useValue: store }, // provide the mock store
      ],
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
      first_name: null,
      last_name: null,
      email: null,
    }); 
  }));

  it('should show error message when form is invalid', () => {
    component.signupForm.setValue({ first_name: '', last_name: '', email: '' });
    component.onSubmit();

    expect(component.errorMessage).toBe(FORM_ERROR_MESSAGES.invalid_form);
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
