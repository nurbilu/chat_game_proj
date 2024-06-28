import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfiles: any[] = [];
  userProfile: any = {};  // Initialize userProfile to an empty object
  isSuperuser: boolean = false;
  editMode: boolean = false;  // Add this line

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.authService.getUserProfile().subscribe(
      data => {
        this.userProfile = data;
      },
      error => {
        console.error('Failed to load user profile', error);
      }
    );
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;  // Toggle edit mode
  }

  updateProfile(): void {
    this.authService.updateUserProfile(this.userProfile).subscribe(
      data => {
        console.log('Profile updated successfully');
        this.userProfile = data;
        this.toggleEditMode();  // Turn off edit mode after update
      },
      error => {
        console.error('Error updating profile', error);
      }
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
