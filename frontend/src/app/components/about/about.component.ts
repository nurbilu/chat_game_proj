import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  constructor(private router: Router) {}

  goToHomePage() {
    this.router.navigate(['/homepage']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToLibrary() {
    this.router.navigate(['/library']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
  // Information about the AI Dungeon Master
  title = 'DeMe - AI Dungeon Master :';
  developer = 'Nur Bilu';
  framework = 'DnD 5e';
}
