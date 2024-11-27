import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-pwd-reset-unreal',
  templateUrl: './pwd-reset-unreal.component.html',
  styleUrls: ['./pwd-reset-unreal.component.css']
})
export class PwdResetUnrealComponent implements OnInit {
  extendedAuthForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.extendedAuthForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Pre-fill form with query params
    this.route.queryParams.subscribe(params => {
      if (params['username'] && params['email']) {
        this.extendedAuthForm.patchValue({
          username: params['username'],
          email: params['email']
        });
      }
    });
  }

  onSubmit() {
    if (this.extendedAuthForm.valid) {
      this.authService.validateUser(this.extendedAuthForm.value).subscribe({
        next: (response) => {
          // Navigate to reset password with token
          this.router.navigate(['/reset-password'], {
            queryParams: { token: response.token }
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
