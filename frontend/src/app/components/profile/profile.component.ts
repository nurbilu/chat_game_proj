import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: any = {};  // Initialize to an empty object or suitable defaults
  isSuperuser: boolean = false;
  showUpdateForm: boolean = false;
  showUserData: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.authService.decodeToken().then((decodedToken) => {
        this.isSuperuser = decodedToken.isSuperuser;
        if (this.isSuperuser) {
            this.router.navigate(['/super-profile']);
        }
    }).catch(error => console.error(error));
  }

  loadUserProfile(): void {
    this.authService.decodeToken().then((tokenPayload) => {
        this.userProfile = {
            username: tokenPayload.username,
            email: tokenPayload.email,
            address: tokenPayload.address,
            birthdate: new Date(tokenPayload.birthdate)
        };
    }).catch(error => console.error(error));
  }

  toggleEditMode(): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.showUserData = false;
  }

  toggleUserDataDisplay(): void {
    this.showUserData = !this.showUserData;
    this.showUpdateForm = false;
  }

  confirmUpdate(): void {
    this.showUpdateForm = false;
    this.showUserData = true;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}