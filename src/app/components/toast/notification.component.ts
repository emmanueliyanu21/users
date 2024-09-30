import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [NgIf],
  templateUrl: './notification.component.html',
})
export class NotificationComponent implements OnInit {
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.success$.subscribe((message) => {
      this.successMessage = message;
      setTimeout(() => (this.successMessage = null), 3000); 
    });

    this.notificationService.error$.subscribe((message) => {
      this.errorMessage = message;
      setTimeout(() => (this.errorMessage = null), 3000); 
    });
  }
}
