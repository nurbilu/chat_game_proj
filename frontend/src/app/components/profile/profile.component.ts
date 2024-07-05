import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: any;
  userProfiles: any[] = [];
  isSuperuser: boolean = false; // Assuming there's a way to determine if the user is a superuser
  editMode: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.checkSuperuser();
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const tokenPayload = this.authService.decodeToken();
    this.userProfile = {
      username: tokenPayload.username,
      email: tokenPayload.email,
      address: tokenPayload.address,
      birthdate: new Date(tokenPayload.birthdate)
    };
  }

  checkSuperuser(): void {
    // Implement logic to check if the user is a superuser
    // This might involve checking a role from the user's profile or token
    this.isSuperuser = true; // Placeholder: set based on actual logic
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  updateProfile(): void {
    this.authService.updateUserProfile(this.userProfile).subscribe(
      response => {
        console.log('Profile updated successfully');
        this.toggleEditMode();
      },
      error => {
        console.error('Error updating profile:', error);
      }
    );
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
