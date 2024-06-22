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
  userProfile: any = null;  // Ensure it's initialized to null
  isSuperuser: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.authService.getUserProfiles().subscribe(
      data => {
        if (Array.isArray(data)) {
          this.userProfiles = data;
          this.isSuperuser = true;
        } else {
          this.userProfile = data;
          this.isSuperuser = false;
        }
      },
      error => {
        console.error('There was an error!', error);
        this.userProfile = {};  // Initialize with an empty object to avoid null access
      }
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
