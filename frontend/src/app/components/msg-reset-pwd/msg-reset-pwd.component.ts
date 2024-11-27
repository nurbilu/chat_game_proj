import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-msg-reset-pwd',
  templateUrl: './msg-reset-pwd.component.html',
  styleUrls: ['./msg-reset-pwd.component.css']
})
export class MsgResetPwdComponent {
  constructor(private router: Router) {}

  backToLogin() {
    this.router.navigate(['/login']);
  }
}
