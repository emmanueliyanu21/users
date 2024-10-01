import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toastSubject = new Subject<{ message: string, success: boolean }>();
  toast$ = this.toastSubject.asObservable();

  show(message: string, success: boolean = true) {
    this.toastSubject.next({ message, success });
  }
}
