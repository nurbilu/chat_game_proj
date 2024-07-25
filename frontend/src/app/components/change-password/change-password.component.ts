import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private toastService: ToastService) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(5)]],
      confirmPassword: ['', Validators.required]  // Corrected to 'confirmPassword'
    }, { validator: this.checkPasswords.bind(this) });  // Ensure 'this' context is bound
  }

  checkPasswords(group: FormGroup) {
    let pass = group.get('newPassword')?.value;
    let confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  onSubmit() {
    if (this.changePasswordForm.valid) {
      this.authService.changePassword(this.changePasswordForm.value).subscribe(
        response => {
          this.toastService.success('Password changed successfully');  // Use toast for success message
        },
        error => {
          this.toastService.error('Error changing password');  // Use toast for error message
        }
      );
    } else {
      this.toastService.error('Form is not valid');  // Use toast for form validation error
    }
  }
}