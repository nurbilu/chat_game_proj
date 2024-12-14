import { Component, TemplateRef } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toasts-container',
  templateUrl: './toasts-container.component.html',
  styleUrls: ['./toasts-container.component.css']
})
export class ToastsContainerComponent {
  constructor(public toastService: ToastService) {}

  getToastIcon(classname: string | undefined): string {
    if (!classname) return 'bi bi-info-circle-fill';
    
    if (classname.includes('success')) return 'bi bi-check-circle-fill';
    if (classname.includes('danger')) return 'bi bi-x-circle-fill';
    if (classname.includes('warning')) return 'bi bi-exclamation-triangle-fill';
    if (classname.includes('purple')) return 'bi bi-clock-fill';
    return 'bi bi-info-circle-fill';
  }
}