import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
})
export class ToastNotificationComponent {
  showToast = false;
  message = '';
  isSuccess = true;

  constructor(private toastService: NotificationService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe(({ message, success }) => {
      this.message = message;
      this.isSuccess = success;
      this.showToast = true;
      setTimeout(() => this.showToast = false, 3000); 
    });
  }

  closeToast() {
    this.showToast = false;
  }
}

