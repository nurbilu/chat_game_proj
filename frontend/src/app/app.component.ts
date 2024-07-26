import { Component, OnInit, TemplateRef, ViewChild, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from './services/toast.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'DeMe - pick your story';
  isSuperUser: boolean = false;

  @ViewChild('offcanvasContent', { static: true }) offcanvasContent!: TemplateRef<any>;
  @ViewChild('logoutTemplate', { static: true }) logoutTemplate!: TemplateRef<any>;
  private offcanvasRef!: NgbOffcanvasRef;

  constructor(
    private router: Router,
    private offcanvasService: NgbOffcanvas,
    private toastService: ToastService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.authService.isLoggedIn.subscribe((isLoggedIn: boolean) => {
      this.ngZone.run(() => {
        if (isLoggedIn) {
          this.isSuperUser = this.authService.isSuperUser();
          if (this.isSuperUser) {
            this.router.navigate(['/super-profile']);
          } else {
            this.router.navigate(['/chat']);
          }
        } else {
          this.router.navigate(['/homepage']);
        }
      });
    });
  }

  logout(): void {
    const username = localStorage.getItem('username');
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/homepage']).then(() => {
        window.location.reload();
      });
      this.toastService.show({
        template: this.logoutTemplate,
        classname: 'bg-success text-light',
        delay: 10000,
        context: { username }
      });
    });
  }

  openOffcanvas() {
    this.offcanvasRef = this.offcanvasService.open(this.offcanvasContent, { ariaLabelledBy: 'offcanvasNavbarLabel' });
  }

  closeOffcanvas() {
    if (this.offcanvasRef) {
      this.offcanvasRef.dismiss();
    }
  }
}