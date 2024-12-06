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
          this.toastService.success('Password reset successfully');
          this.router.navigate(['/msg-reset-pwd']);
        },
        error: (error) => {
          this.toastService.error(error.message || 'Error resetting password');
        }
      });
    } else {
      if (this.resetPwdForm.errors?.['notSame']) {
        this.toastService.error('Passwords do not match');
      } else {
        this.toastService.error('Please fill in all required fields correctly');
      }
    }
  }
}