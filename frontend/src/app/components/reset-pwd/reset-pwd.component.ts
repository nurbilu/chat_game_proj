import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reset-pwd',
  templateUrl: './reset-pwd.component.html',
  styleUrls: ['./reset-pwd.component.css']
})
export class ResetPwdComponent {
  resetPwdForm: FormGroup;
  token: string;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.router.navigate(['/forget-password']);
      this.toastService.error('Invalid reset token');
    }

    this.resetPwdForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(5)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords.bind(this) });
  }

  checkPasswords(group: FormGroup) {
    const pass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.resetPwdForm.valid) {
      const passwordData = {
        newPassword: this.resetPwdForm.get('newPassword')?.value,
        confirmPassword: this.resetPwdForm.get('confirmPassword')?.value
      };

      this.authService.resetPassword(this.token, passwordData).subscribe({
        next: () => {
          this.toastService.success('Your password has been successfully reset. You can now log in with your new password.');
          this.router.navigate(['/msg-reset-pwd']);
        },
        error: (error) => {
          this.toastService.error(error.message || 'Unable to reset password. Please try again or contact support if the problem persists.');
        }
      });
    } else {
      if (this.resetPwdForm.errors?.['notSame']) {
        this.toastService.error('The passwords you entered do not match. Please make sure both passwords are identical.');
      } else if (this.resetPwdForm.get('newPassword')?.errors?.['minlength']) {
        this.toastService.error('Password must be at least 5 characters long.');
      } else if (this.resetPwdForm.get('newPassword')?.errors?.['required']) {
        this.toastService.error('Please enter a new password.');
      } else if (this.resetPwdForm.get('confirmPassword')?.errors?.['required']) {
        this.toastService.error('Please confirm your new password.');
      } else {
        this.toastService.error('Please fill in all required fields correctly.');
      }
    }
  }
}