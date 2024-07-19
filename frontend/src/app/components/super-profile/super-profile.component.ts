import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-super-profile',
  templateUrl: './super-profile.component.html',
  styleUrls: ['./super-profile.component.css']
})
export class SuperProfileComponent implements OnInit {
  userProfiles: any[] = [];
  selectedProfile: any = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadSuperUserProfiles();
  }

  loadSuperUserProfiles(): void {
    this.isLoading = true;
    this.authService.getSuperUserProfiles().subscribe({
        next: (profiles) => {
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

  onProfileSelect(profile: any): void {
    this.selectedProfile = profile;
    // Handle additional profile selection logic here, if needed
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error: any) => console.error('Logout failed:', error)
    });
  }
}