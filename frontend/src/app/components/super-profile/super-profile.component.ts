import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface UserProfile {
  username: string;
  email: string;
  address?: string;
  birthdate?: string;
  password?: string;
  pwd_user_str?: string;  // Add this field
  first_name?: string;    // Add this field
  last_name?: string;     // Add this field
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

  constructor(private authService: AuthService, private router: Router) {}

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
    // Handle additional profile selection logic here, if needed
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