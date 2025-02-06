import { Component, OnInit, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  @Output() profileUpdated = new EventEmitter<void>();
  @Output() closeEdit = new EventEmitter<void>();

  profileForm: FormGroup;

  @ViewChild('successTemplate', { static: true }) successTemplate!: TemplateRef<any>;
  @ViewChild('errorTemplate', { static: true }) errorTemplate!: TemplateRef<any>;
  showUpdateForm: boolean = false;
  showUserData: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.profileForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      birthdate: [''],
      profilePicture: [null]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.getUserProfile().subscribe(
      (data) => {
        this.profileForm.patchValue({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          address: data.address,
          birthdate: data.birthdate
        });
      },
      (error) => {
        this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
      }
    );
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.profileForm.patchValue({ profilePicture: file });
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const formData = new FormData();
      Object.keys(this.profileForm.value).forEach(key => {
        formData.append(key, this.profileForm.value[key]);
      });

      const profilePicture = this.profileForm.get('profilePicture')!.value;
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }

      this.authService.updateUserProfile(formData).subscribe(
        (data) => {
          this.toastService.show({ template: this.successTemplate, classname: 'bg-success text-light', delay: 10000 });
          this.profileUpdated.emit();
          this.loadUserProfile();
        },
        (error) => {
          this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
        }
      );
    }
  } 
  
  cancelEdit(): void {
    this.showUpdateForm = false;
    this.showUserData = true;
    this.loadUserProfile();
  }

  closeEditProfile(): void {
    this.closeEdit.emit();
  }
}
