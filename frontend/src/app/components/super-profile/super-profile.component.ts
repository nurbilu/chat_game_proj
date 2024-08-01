import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface UserProfile {
  username: string;
  email: string;
  address?: string;
  birthdate?: string;
  password?: string;
  pwd_user_str?: string;
  first_name?: string;
  last_name?: string;
}

@Component({
  selector: 'app-super-profile',
  templateUrl: './super-profile.component.html',
  styleUrls: ['./super-profile.component.css']
})
export class SuperProfileComponent implements OnInit {
  userProfiles: UserProfile[] = [];
  selectedProfile: UserProfile | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  superUserForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.superUserForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSuperUserProfiles();
  }

  loadSuperUserProfiles(): void {
    this.isLoading = true;
    this.authService.getSuperUserProfiles().subscribe({
      next: (profiles: UserProfile[]) => {
        this.userProfiles = profiles;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load superuser profiles:', error);
        this.error = 'Failed to load superuser profiles';
        this.isLoading = false;
      }
    });
  }

  onProfileSelect(profile: UserProfile): void {
    this.selectedProfile = profile;
  }

  createSuperUser(): void {
    if (this.superUserForm.valid) {
      this.authService.createSuperUser(this.superUserForm.value).subscribe({
        next: () => {
          this.loadSuperUserProfiles();
          this.superUserForm.reset();
        },
        error: (error) => {
          console.error('Failed to create superuser:', error);
          this.error = 'Failed to create superuser';
        }
      });
    }
  }

  hideTable(): void {
    this.selectedProfile = null;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/homepage']);
      },
      error: (error: any) => console.error('Logout failed:', error)
    });
  }
}