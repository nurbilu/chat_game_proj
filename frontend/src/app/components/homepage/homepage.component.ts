import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  isSuperUser: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isSuperUser = this.authService.isSuperUser();
  }
}