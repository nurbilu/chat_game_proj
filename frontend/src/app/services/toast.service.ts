import { Injectable, TemplateRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: any[] = [];  // Array to store toast messages

  constructor(private toastr: ToastrService) {}

  success(message: string) {
    this.toastr.success(message);
  }

  error(message: string) {
    this.toastr.error(message);
  }

  show(toast: { template?: TemplateRef<any>, classname?: string, delay?: number, context?: any }) {
    console.log('Showing toast with context:', toast.context);
    if (!toast.context || !toast.context.username) {
        console.error('Toast context is missing or username is undefined');
    }
    this.toasts.push(toast);
  }

  remove(toast: any): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  getToasts() {
    return this.toasts;
  }
}