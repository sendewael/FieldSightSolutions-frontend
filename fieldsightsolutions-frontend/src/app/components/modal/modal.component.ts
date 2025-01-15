import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  standalone: true,
})
export class ModalComponent {

  @Input() message: string = '';
  @Input() showModal: boolean = false;

  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
