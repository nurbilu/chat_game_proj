import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forget-pwd',
  templateUrl: './forget-pwd.component.html',
  styleUrls: ['./forget-pwd.component.css']
})
export class ForgetPwdComponent {
  forgetPwdForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.forgetPwdForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgetPwdForm.valid) {
      this.authService.validateUser(this.forgetPwdForm.value).subscribe(
        response => {
          this.router.navigate(['/reset-password'], { queryParams: { token: response.token } });
        },
        error => {
          this.toastService.error('Error validating user');
        }
      );
    } else {
      this.toastService.error('Form is not valid');
    }
  }
}