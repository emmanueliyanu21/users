import { Injectable, Inject, PLATFORM_ID, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';
import { UsersEndpoints } from './endpoint.constant';
import { User } from '../store/user';

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
      const existingUsers = this.getUsersFromLocalStorage();

      if (existingUsers.length === 0) {
        const adminUser = {
          first_name: 'Admin',
          last_name: 'Admin',
          tempKey: 'admin',
          role: 'defaultAdmin',
          adminFor: 1,
          avatar: '',
          id: 0,
          email: 'admin@gmail.com',
        };

        this.saveUsers([adminUser])
      }
    }
  }

  submitUser(userData: any): Observable<any> {
    if (typeof window !== 'undefined') {
      let existingUsers = this.getUsersFromLocalStorage();

      if (existingUsers.length === 0) {
        this.initializeAdminUsers();
        existingUsers = this.getUsersFromLocalStorage();
      }
      const prevUser = existingUsers[existingUsers.length - 1];
      const prevId = prevUser.id

      const newUser = {
        ...userData,
        id: prevId + 1,
        adminFor: prevId + 2,
      };

      existingUsers.push(newUser);
      this.saveUsers(existingUsers);
    }

    return this.apiService.post(`${UsersEndpoints.users}`, userData);
  }

  getUsers(): Observable<User[]> {
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
    } 
    return [];
  }

  saveUsersToLocalStorage(users: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.saveUsers(users);
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
        const index = users.findIndex((u) => u.email === user.email);
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

        const {adminFor, ...authData}  = user;
        if (user) {
          localStorage.setItem('authData', JSON.stringify(authData));
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
          (user) => user.id === updatedUser.id
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
    const users = this.getUsersFromLocalStorage();
    const index = users.findIndex((u: any) => u.id === user.id);

    if (index !== -1) {
      users[index] = user;
      this.saveUsers(users);
    }

    return of(user);
  }

  deleteRecord(id: number): Observable<boolean> {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.filter((u: any) => u.id !== id);
    this.saveUsers(updatedUsers);
    return of(true);
  }

  getUserById(id: number): Observable<User | null> {
    return this.getUsers().pipe(
      map(users => users.find(u => u.id === id) || null)
    );
  }

}
