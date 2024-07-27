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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.token = this.route.snapshot.queryParams['token'];
    this.resetPwdForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(5)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords.bind(this) });
  }

  checkPasswords(group: FormGroup) {
    let pass = group.get('newPassword')?.value;
    let confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  onSubmit() {
    if (this.resetPwdForm.valid) {
      this.authService.resetPassword(this.token, this.resetPwdForm.value).subscribe(
        response => {
          this.toastService.success('Password reset successfully');
          this.router.navigate(['/login']);
        },
        error => {
          this.toastService.error('Error resetting password');
        }
      );
    } else {
      this.toastService.error('Form is not valid');
    }
  }
}