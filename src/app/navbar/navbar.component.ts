import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLinkActive,
    RouterLink,
    NgIf
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] 
})
export class NavbarComponent {
  isLoggedIn: boolean = false;
  userFirstName: string | null = null;
  userLastName: string | null = null;
  userAvatar: string | null = 'https://via.placeholder.com/50';
  private loginStatusSubscription!: Subscription;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
    this.getUserData();

    this.loginStatusSubscription = this.userService.loginStatusChanged.subscribe((status) => {
      this.isLoggedIn = status;
      this.getUserData();
    });
  }

  checkLoginStatus() {
    this.isLoggedIn = this.userService.isLoggedIn(); 
  }

  getUserData() {
    if (this.isLoggedIn) {
      const userData = JSON.parse(localStorage.getItem('authData') || '{}');
      this.userFirstName = userData.first_name; 
      this.userLastName = userData.last_name; 
      this.userAvatar = userData.avatar || this.userAvatar; 
    }
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']); 
  }

  ngOnDestroy() {
    this.loginStatusSubscription.unsubscribe();
  }

}
