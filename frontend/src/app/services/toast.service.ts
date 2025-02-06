import { Injectable, TemplateRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: any[] = [];
  errorTemplate!: TemplateRef<any>;
  successTemplate!: TemplateRef<any>;
  warningTemplate!: TemplateRef<any>;
  infoTemplate!: TemplateRef<any>;

  constructor(private toastr: ToastrService) {}

  success(message: string, title: string = 'Success') {
    this.toastr.success(message, title, {
      timeOut: 5000,
      positionClass: 'toast-top-center',
      closeButton: true,
      progressBar: true,
      enableHtml: true,
      toastClass: 'ngx-toastr toast-success animate slideDown',
      titleClass: 'toast-title',
      messageClass: 'toast-message'
    });
  }

  error(message: string, title: string = 'Error') {
    this.toastr.error(message, title, {
      timeOut: 5000,
      positionClass: 'toast-top-center',
      closeButton: true,
      progressBar: true,
      enableHtml: true,
      toastClass: 'ngx-toastr toast-error animate slideDown',
      titleClass: 'toast-title',
      messageClass: 'toast-message'
    });
  }

  warning(message: string, title: string = 'Warning') {
    this.toastr.warning(message, title, {
      timeOut: 5000,
      positionClass: 'toast-top-center',
      closeButton: true,
      progressBar: true,
      enableHtml: true,
      toastClass: 'ngx-toastr toast-warning animate slideDown',
      titleClass: 'toast-title',
      messageClass: 'toast-message'
    });
  }

  info(message: string, title: string = 'Info') {
    this.toastr.info(message, title, {
      timeOut: 5000,
      positionClass: 'toast-top-center',
      closeButton: true,
      progressBar: true,
      enableHtml: true,
      toastClass: 'ngx-toastr toast-info animate slideDown',
      titleClass: 'toast-title',
      messageClass: 'toast-message'
    });
  }

  purple(message: string, title: string = 'Session Expired') {
    this.toastr.show(message, title, {
      timeOut: 5000,
      positionClass: 'toast-top-center',
      closeButton: true,
      progressBar: true,
      enableHtml: true,
      toastClass: 'ngx-toastr toast-purple animate slideDown',
      titleClass: 'toast-title',
      messageClass: 'toast-message'
    });
  }

  show(toast: { template?: TemplateRef<any>, classname?: string, delay?: number, context?: any }) {
    if (toast.template) {
      this.toasts.push(toast);
    } else if (toast.context?.message) {

      const type = toast.classname?.includes('success') ? 'success' :
                   toast.classname?.includes('danger') ? 'error' :
                   toast.classname?.includes('warning') ? 'warning' : 'info';
      
      this[type](toast.context.message);
    }
  }

  remove(toast: any): void {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  getToasts() {
    return this.toasts;
  }

  setTemplates(templates: {
    error?: TemplateRef<any>,
    success?: TemplateRef<any>,
    warning?: TemplateRef<any>,
    info?: TemplateRef<any>
  }) {
    if (templates.error) this.errorTemplate = templates.error;
    if (templates.success) this.successTemplate = templates.success;
    if (templates.warning) this.warningTemplate = templates.warning;
    if (templates.info) this.infoTemplate = templates.info;
  }
}
