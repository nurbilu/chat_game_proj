import { Injectable, TemplateRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: any[] = [];  // Array to store toast messages

  errorTemplate!: TemplateRef<any>;  // Ensure this is initialized

  constructor(private toastr: ToastrService) {}

  success(message: string) {
    this.toasts.push({ classname: 'bg-success text-light', delay: 5000, message });
  }

  error(message: string) {
    this.toasts.push({ classname: 'bg-danger text-light', delay: 5000, message });
  }

  show(toast: { template?: TemplateRef<any>, classname?: string, delay?: number, context?: any }) {
    this.toasts.push(toast);

    if (toast.context && toast.context.username) {
      console.log(`Showing toast for username: ${toast.context.username}`);
    } else {
      console.log('Showing toast without username');
    }
  }

  remove(toast: any): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  getToasts() {
    return this.toasts;
  }
}