import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: any;
  userProfiles: any[] = [];
  isSuperuser: boolean = false; // Assuming isSuperuser is set based on user role
  showUpdateForm: boolean = false;
  showUserData: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkSuperuser();
    this.loadUserProfile();
    if (this.isSuperuser) {
      this.loadAllUserProfiles();
    }
  }

  loadUserProfile(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
    const tokenPayload = this.authService.decodeToken();
    if (!tokenPayload || !tokenPayload.username) {
      console.error('Token payload invalid:', tokenPayload);
      return;
    }
    this.userProfile = {
      username: tokenPayload.username,
      email: tokenPayload.email,
      address: tokenPayload.address,
      birthdate: new Date(tokenPayload.birthdate)
    };
  }

  loadAllUserProfiles(): void {
    this.authService.getUserProfiles().subscribe({
      next: (profiles) => {
        this.userProfiles = profiles;
      },
      error: (error) => console.error('Failed to load user profiles:', error)
    });
  }

  checkSuperuser(): void {
    // Implement logic to check if the user is a superuser
    // This might involve checking a role from the user's profile or token
    this.isSuperuser = true; // Placeholder: set based on actual logic
  }

  toggleEditMode(): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.showUserData = false; // Hide user data when in edit mode
  }

  toggleUserDataDisplay(): void {
    this.showUserData = !this.showUserData;
    this.showUpdateForm = false;
  }

  confirmUpdate(): void {
    // Perform update logic here
    this.showUpdateForm = false; // Hide the form after update
    this.showUserData = true; // Show user data after update
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}