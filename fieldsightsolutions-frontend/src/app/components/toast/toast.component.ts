import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  isVisible = false; // To manage toast visibility
  @Input()
  message = '';
  @Input()
  timeout = 3000;
  @Input()
  toastClass: string = 'bg-green-500';
  @Input()
  toastHover: string = 'bg-green-400';

  hideToast() {
    this.isVisible = false;
  }

  showToast() {
    this.isVisible = true;

    setTimeout(() => {
      this.isVisible = false;
    }, this.timeout);
  }
}
