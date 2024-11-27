import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forget-pwd',
  templateUrl: './forget-pwd.component.html',
  styleUrls: ['./forget-pwd.component.css']
})
export class ForgetPwdComponent {
  forgetPwdForm: FormGroup;
  realEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];

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

  isRealEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return this.realEmailDomains.includes(domain);
  }

  onSubmit() {
    if (this.forgetPwdForm.valid) {
      const { username, email } = this.forgetPwdForm.value;

      if (this.isRealEmail(email)) {
        this.authService.sendPasswordResetEmail(email).subscribe({
          next: () => {
            this.router.navigate(['/msg-reset-pwd']);
          },
          error: () => {
            this.toastService.error('Error sending reset email');
          }
        });
      } else {
        // Handle non-real email case
        this.router.navigate(['/pwd-reset-unreal'], { 
          queryParams: { 
            username: username,
            email: email 
          }
        });
      }
    }
  }
}