import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  @Input() isModalOpen!: boolean;

  @Output() modalCanceled = new EventEmitter<void>();
  @Output() confirmUserDelete = new EventEmitter<void>();

  showToast = false;
  message = '';
  isSuccess = true;

  constructor() {}

  ngOnInit() {}

  cancelModal() {
    this.showToast = false;
    this.modalCanceled.emit();
  }

  confirmDelete() {
    this.confirmUserDelete.emit();
  }
}
