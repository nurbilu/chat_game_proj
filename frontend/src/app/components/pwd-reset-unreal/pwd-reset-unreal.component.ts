import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-pwd-reset-unreal',
  templateUrl: './pwd-reset-unreal.component.html',
  styleUrl: './pwd-reset-unreal.component.css'
})
export class PwdResetUnrealComponent {
  unrealForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService
  ) {
    this.unrealForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.unrealForm.valid) {
      this.router.navigate(['/reset-pwd']);
    } else {
      this.toastService.error('Please fill all required fields');
    }
  }
}
