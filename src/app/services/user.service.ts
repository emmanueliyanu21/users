import { Injectable, Inject, PLATFORM_ID, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

import { isPlatformBrowser } from '@angular/common';
import { User } from '../Interface/IUser';
import { ApiService } from './api.service';
import { UsersEndpoints } from './endpoint.constant';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  loginStatusChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  initializeAdminUsers() {
    if (typeof window !== 'undefined') {
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');

      if (existingUsers.length === 0) {
        const adminUser = {
          first_name: 'Admin',
          last_name: 'Admin',
          tempKey: 'admin',
          role: 'defaultAdmin',
          avatar: '',
          id: 0,
          email: 'admin@gmail.com',
        };

        localStorage.setItem('users', JSON.stringify([adminUser]));
      }
    }
  }

  submitUser(userData: any): Observable<any> {
    if (typeof window !== 'undefined') {
      let existingUsers = JSON.parse(localStorage.getItem('users') || '[]');

      if (existingUsers.length === 0) {
        this.initializeAdminUsers();
        existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      }

      const newUser = {
        ...userData,
        id: existingUsers.length,
      };

      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));
    }

    return this.apiService.post(`${UsersEndpoints.users}`, userData);

  }

  getUsers(): Observable<any[]> {
    if (typeof window !== 'undefined') {
      const localStorageUsers = JSON.parse(
        localStorage.getItem('users') || '[]'
      );

      return of(localStorageUsers);
    } else {
      return of([]);
    }
  }

  getUsersFromLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const users = localStorage.getItem('users');
      return users ? JSON.parse(users) : [];
    } else {
      return [];
    }
  }

  saveUsersToLocalStorage(users: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  saveUsers(users: any[]) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  registerUser(user: any) {
    this.getUsers().subscribe((users) => {
      user.role = 'pending';
      users.push(user);
      this.saveUsers(users);

      if (users.length === 1) {
        this.approveUser(user);
        alert(
          `User ${user.username} approved with temporary key: ${user.tempKey}`
        );
      } else {
        const lastApprovedUser = users[users.length - 2];
        if (lastApprovedUser && lastApprovedUser.role === 'admin') {
          this.approveUser(user);
          user.role = 'admin';
          alert(`User ${user.username} approved and promoted to admin.`);
        }
      }
    });
  }

  approveUser(user: any): Observable<any> {
    return this.getUsers().pipe(
      map((users) => {
        const index = users.findIndex((u) => u.username === user.username);
        if (index !== -1) {
          users[index].role = 'admin';
          users[index].tempKey = this.generateTempKey();
          this.saveUsers(users);
          return users[index];
        }
        return null;
      })
    );
  }

  private generateTempKey(): string {
    return Math.random().toString(36).substr(2, 8);
  }

  login(email: string, tempKey: string): Observable<boolean> {
    this.initializeAdminUsers();
    const users = this.getUsers();
    return users.pipe(
      map((usersArray: any[]) => {
        const user = usersArray.find(
          (u) =>
            (u.email === email && u.tempKey === tempKey) ||
            (email === 'admin@gmail.com' && tempKey === 'admin')
        );

        if (user) {
          localStorage.setItem('authData', JSON.stringify(user));
          this.loginStatusChanged.emit(true);
        }

        return !!user;
      })
    );
  }

  createRecord(newRecord: any): Observable<any> {
    const users = this.getUsers();
    return users.pipe(
      map((usersArray) => {
        usersArray.push(newRecord);
        this.saveUsers(usersArray);
        return newRecord;
      }),
      catchError((error) => {
        return of(null);
      })
    );
  }

  updateUser(updatedUser: User): Observable<User | null> {
    return this.getUsers().pipe(
      map((users) => {
        const index = users.findIndex(
          (user) => user.first_name === updatedUser.first_name
        );
        if (index !== -1) {
          users[index] = { ...users[index], ...updatedUser };

          this.saveUsers(users);

          return users[index];
        }
        return null;
      }),
      catchError((error) => {
        return of(null);
      })
    );
  }

  isLoggedIn(): boolean {
    const users = this.getUsersFromLocalStorage();
    return users.some((user: User) => user.role === 'admin');
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authData');
      this.loginStatusChanged.emit(false);
    }
  }

  updateRecord(user: any): Observable<any> {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.id === user.id);

    if (index !== -1) {
      users[index] = user;
      localStorage.setItem('users', JSON.stringify(users));
    }

    return of(user);
  }

  deleteRecord(username: string): Observable<boolean> {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.filter((u: any) => u.first_name !== username);

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return of(true);
  }
}
