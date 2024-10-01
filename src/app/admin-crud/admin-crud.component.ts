import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../Interface/IUser';
import { ROLE } from '../Enum/Role';
import { Store } from '@ngrx/store';
import { AppState } from '../store/user';

import * as UserActions from '../store/user.action';
import { selectAllUsers, selectUserError, selectUserLoading } from '../store/user.selector';

@Component({
  selector: 'app-admin-crud',
  standalone: true,
  imports: [NgFor, FormsModule, NgIf, AsyncPipe],
  templateUrl: './admin-crud.component.html',
})
export class AdminCrudComponent {
  users: User[] = [];
  record: any = { first_name: '', last_name: '', email: '' };
  tempMessage: string | null = null;
  loggedInUser: any;
  userRole = ROLE;
  showEditForm: boolean = false;
  editedUser!: User;
  hasUsers: boolean = false; 

  users$ = this.store.select(selectAllUsers);
  loading$ = this.store.select(selectUserLoading);
  error$ = this.store.select(selectUserError);

  constructor(private userService: UserService, private store: Store<AppState>) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('authData');

      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          this.loggedInUser = {
            first_name: parsedUserData.first_name || '',
            id: parsedUserData.id,
          };
        } catch (error) {
          this.loggedInUser = { first_name: '' };
        }
      } else {
        this.loggedInUser = { first_name: '' };
      }
    }

    this.store.dispatch(UserActions.loadUsers());

    this.users$.subscribe(users => {
      this.hasUsers = users.length > 1; 
    });

  }

  approveRecord(user: User) {
    if (user.id !== this.loggedInUser.id + 1) {
      this.tempMessage = 'You can only approve the next user in sequence.';
      setTimeout(() => {
        this.tempMessage = null;
      }, 5000);
      return;
    }

    const tempKey = Math.random().toString(36).substring(2, 10);

    user.approved = true;
    user.role = 'admin';
    user.tempKey = tempKey;

    this.userService.updateUser(user).subscribe((updatedUser) => {
      if (updatedUser) {
        this.tempMessage = `Temporary Key: ${tempKey}`;
        setTimeout(() => {
          this.tempMessage = null;
        }, 20000);
      } else {
      }
    });
    this.store.dispatch(UserActions.loadUsers());
  }

  editUser(user: User) {
    this.showEditForm = true;
    this.editedUser = user;
    this.record = { ...user };
  }

  onSubmit() {
    this.showEditForm = false;
    const user = {
      email: this.record.email,
      first_name: this.record.first_name,
      last_name: this.record.last_name,
      id: this.editedUser.id,
      role: this.editedUser.role,
      tempKey: this.editedUser.tempKey,
      approved: this.editedUser.approved,
    };
    this.updateUser(user);
  }

  updateUser(user: any) {
    this.showEditForm = true;

    if (user.id !== this.loggedInUser.id + 1) {
      this.tempMessage = 'You can only Update the next user in sequence.';
      setTimeout(() => {
        this.tempMessage = null;
      }, 5000);
      return;
    }

    this.userService.updateRecord(user).subscribe((updatedRecord) => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      const index = users.findIndex((u: any) => u.id === updatedRecord.id);
      if (index !== -1) {
        users[index] = updatedRecord;
        this.showEditForm = false;
        localStorage.setItem('users', JSON.stringify(users));
        this.store.dispatch(UserActions.loadUsers());
        this.tempMessage = `User ${updatedRecord.first_name} updated successfully.`;
        setTimeout(() => {
          this.tempMessage = null;
        }, 5000);
      }
    });
  }

  deleteRecord(username: string) {
    const user = this.users.find((u) => u.first_name === username);

    if (user && user.id !== this.loggedInUser.id + 1) {
      this.tempMessage = 'You can only delete the next user in sequence.';
      setTimeout(() => {
        this.tempMessage = null;
      }, 5000);
      return;
    }

    this.userService.deleteRecord(username).subscribe((success) => {
      if (success) {
        const updatedUsers = this.users.filter(
          (u) => u.first_name !== username
        );

        localStorage.setItem('users', JSON.stringify(updatedUsers));

        this.tempMessage = `User ${username} deleted successfully.`;
        setTimeout(() => {
          this.tempMessage = null;
        }, 5000);
        this.store.dispatch(UserActions.loadUsers());
      } else {
        this.tempMessage =
          'Failed to delete user or you cannot delete your own record.';
        setTimeout(() => {
          this.tempMessage = null;
        }, 5000);
      }
    });
  }
}
