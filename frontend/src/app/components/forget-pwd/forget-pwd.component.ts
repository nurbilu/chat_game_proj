import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forget-pwd',
  templateUrl: './forget-pwd.component.html',
  styleUrls: ['./forget-pwd.component.css']
})
export class ForgetPwdComponent implements OnInit {
  forgetPwdForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.forgetPwdForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required]
    });
  }

  ngOnInit() {}

  onSubmit() {
    if (this.forgetPwdForm.valid) {
      this.authService.validateUser(this.forgetPwdForm.value).subscribe({
        next: (response) => {
          // Navigate to reset password with token and credentials
          this.router.navigate(['/reset-password'], {
            queryParams: { 
              token: response.token,
              username: this.forgetPwdForm.get('username')?.value,
              email: this.forgetPwdForm.get('email')?.value
            }
          });
        },
        error: () => {
          this.toastService.error('Invalid user information');
        }
      });
    } else {
      this.toastService.error('Please fill in all required fields');
    }
  }
}