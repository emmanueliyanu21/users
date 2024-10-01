import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ROLE } from '../Enum/Role';
import { Store } from '@ngrx/store';
import { AppState, User } from '../store/user';

import * as UserActions from '../store/user.action';
import {
  selectAllUsers,
  selectUserError,
  selectUserLoading,
} from '../store/user.selector';
import { NotificationService } from '../services/notification.service';
import { ModalComponent } from '../components/modal/modal.component';

@Component({
  selector: 'app-admin-crud',
  standalone: true,
  imports: [NgFor, FormsModule, NgIf, AsyncPipe, ModalComponent],
  templateUrl: './admin-crud.component.html',
})
export class AdminCrudComponent {
  users: User[] = [];
  editedUser = { first_name: '', last_name: '', email: '' };
  tempMessage: string | null = null;
  loggedInUser: any;
  userRole = ROLE;
  showEditForm: boolean = false;
  record!: User;
  hasUsers: boolean = false;
  isModalOpen: boolean = false;
  selectedUser!: User;

  users$ = this.store.select(selectAllUsers);
  loading$ = this.store.select(selectUserLoading);
  error$ = this.store.select(selectUserError);

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('authData');

      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          this.loggedInUser = {
            first_name: parsedUserData.first_name || '',
            id: parsedUserData.id,
            adminFor: parsedUserData.adminFor,
            email: parsedUserData.email,
          };
        } catch (error) {
          this.loggedInUser = { first_name: '' };
        }
      } else {
        this.loggedInUser = { first_name: '' };
      }
    }

    this.store.dispatch(UserActions.loadUsers());

    this.users$.subscribe((users) => {
      this.users = users;
      this.hasUsers = users.length > 1;
    });
  }

  getUsersUnderAdmin(id: number): number{
    let adminFor = -1;
    this.userService.getUserById(id).subscribe(user => {
      if (user) {
        adminFor = user.adminFor;
      }
    });
    return adminFor;
  }

  approveRecord(user: User) {
    if (user.id !== this.getUsersUnderAdmin(this.loggedInUser.id)) {
      this.notificationService.show(
        'You can only approve the next user in sequence.',
        false
      );

      return;
    }

    const tempKey = Math.random().toString(36).substring(2, 10);

    const updatedUser = {
      ...user,
      approved: true,
      role: 'admin',
      tempKey: tempKey,
    };

    this.userService.updateUser(updatedUser).subscribe((updatedUser) => {
      if (updatedUser) {
        this.notificationService.show(`User Approved Successfully`, true);
      }
    });
    this.store.dispatch(UserActions.loadUsers());
  }

  editUser(user: User) {
    this.showEditForm = true;
    this.record = user;
    this.editedUser = { ...user };
  }

  onSubmit() {
    this.showEditForm = false;
    const user = {
      ...this.record,
      email: this.editedUser.email,
      first_name: this.editedUser.first_name,
      last_name: this.editedUser.last_name,
    };
    this.updateUser(user);
  }

  updateUser(user: any) {
    this.showEditForm = true;

    if (user.id !== this.getUsersUnderAdmin(this.loggedInUser.id)) {
      this.notificationService.show(
        'You can only Update the next user in sequence.',
        false
      );

      return;
    }

    this.userService.updateRecord(user).subscribe((updatedRecord) => {
      const users = this.userService.getUsersFromLocalStorage();

      const index = users.findIndex((u: any) => u.id === updatedRecord.id);
      if (index !== -1) {
        users[index] = updatedRecord;
        this.showEditForm = false;
        this.userService.saveUsers(users);
        this.store.dispatch(UserActions.loadUsers());
        this.notificationService.show(
          `User ${updatedRecord.first_name} updated successfully.`,
          true
        );
      }
    });
  }

  openModal(user: User) {
    console.log(user, 'user modal');

    this.selectedUser = user;
    this.isModalOpen = true;
  }

  handleModalCancel() {
    this.isModalOpen = false;
  }

  handleDeleteUser() {
    this.handleModalCancel();
    this.deleteRecord();
  }

  deleteRecord() {
    const userEmail = this.selectedUser.email;
    const user = this.users.find((u) => u.email === userEmail);
    console.log(user, userEmail, 'ppp', this.users);

    if (user) {
      if (user.id !== this.getUsersUnderAdmin(this.loggedInUser.id)) {
        this.tempMessage = 'You can only delete the next user in sequence.';
        setTimeout(() => {
          this.tempMessage = null;
        }, 5000);
        return;
      }
      console.log(this.users, 'users before');

      const previousIndex = this.users.findIndex((u) => u.adminFor === user.id);
      const previousUser = this.users[previousIndex];
      console.log(previousUser, 'users previous');

      if (previousUser) {
        const updatedUser = {
          ...previousUser,
          adminFor: user.adminFor
        }
        this.userService.updateUser(updatedUser).subscribe((updatedUser) => {
          if (updatedUser) {
            this.notificationService.show(
              `Admin rights transferred to ${previousUser.email}.`,
              true
            );
          }
        });
      }

    this.userService.deleteRecord(user.id).subscribe((success) => {
      if (success) {
        
        this.notificationService.show(
          `User ${userEmail} deleted successfully.`,
          true
        );

        this.store.dispatch(UserActions.loadUsers());
      } else {
        this.notificationService.show(
          'Failed to delete user or you cannot delete your own record.',
          false
        );
      }
    });
    }

  }
}
