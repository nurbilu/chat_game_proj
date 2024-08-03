import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private toastService: ToastService, private router: Router) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(5)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords.bind(this) });
  }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
      }
    });
  }

  checkPasswords(group: FormGroup) {
    let pass = group.get('newPassword')?.value;
    let confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  onSubmit() {
    if (this.changePasswordForm.valid) {
      this.authService.changePassword(this.changePasswordForm.value).subscribe(
        (response: any) => {
          this.toastService.success('Password changed successfully');
        },
        (error: any) => {
          this.toastService.error('Error changing password');
        }
      );
    } else {
      this.toastService.error('Form is not valid');
    }
  }
}