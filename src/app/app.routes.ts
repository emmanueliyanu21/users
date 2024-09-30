import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { AdminCrudComponent } from './admin-crud/admin-crud.component';

export const routes: Routes = [
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin-crud', component: AdminCrudComponent },
  { path: '', redirectTo: '/signup', pathMatch: 'full' },
];
