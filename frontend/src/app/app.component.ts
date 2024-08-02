import { Component, OnInit, TemplateRef, ViewChild, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NgbOffcanvas, NgbOffcanvasRef, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
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
  username: string | null = null;
  password: string = '';
  private modalRef: NgbModalRef | undefined;

  @ViewChild('offcanvasContent', { static: true }) offcanvasContent!: TemplateRef<any>;
  @ViewChild('logoutTemplate', { static: true }) logoutTemplate!: TemplateRef<any>;
  @ViewChild('loginTemplate', { static: true }) loginTemplate!: TemplateRef<any>;
  @ViewChild('welcomeTemplate', { static: true }) welcomeTemplate!: TemplateRef<any>;
  @ViewChild('errorTemplate', { static: true }) errorTemplate!: TemplateRef<any>;
  @ViewChild('successTemplate', { static: true }) successTemplate!: TemplateRef<any>;
  private offcanvasRef!: NgbOffcanvasRef;
  isLoggedIn: boolean = false;

  constructor(
    private router: Router,
    private offcanvasService: NgbOffcanvas,
    private toastService: ToastService,
    private authService: AuthService,
    private ngZone: NgZone,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.authService.getUsername().subscribe((username: string) => {
          this.username = username;
          this.isSuperUser = this.authService.isSuperUser();
          this.router.navigate(['/chat']).then(() => {
            this.reloadCurrentRoute(); // Reload the current route once after navigation
          });
        });
      } else {
        this.router.navigate(['/homepage']);
      }
    });
  }

  private reloadCurrentRoute() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/homepage']).then(() => {
        window.location.reload();
        console.log('Navigated to homepage');
      });
    });
  }

  openLogoutModal(content: any) {
    this.username = localStorage.getItem('username');
    this.modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    if (this.modalRef.componentInstance) {
      this.modalRef.componentInstance.username = this.username;
    }
  }

  confirmLogout() {
    if (this.modalRef) {
      this.modalRef.close('Logout click');
    }
    this.logout();
  }

  cancelLogout() {
    if (this.modalRef) {
      this.modalRef.dismiss('cancel click');
    }
  }

  crossClick() {
    if (this.modalRef) {
      this.modalRef.dismiss('Cross click');
    }
  }

  openLoginModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  login(modal: any) {
    if (this.username && this.password) {
      this.authService.login(this.username, this.password).subscribe({
        next: (response) => {
          this.toastService.show({
            template: this.welcomeTemplate,
            classname: 'bg-success text-light',
            delay: 10000,
            context: { username: this.username }
          });
          modal.close('Login click');
          this.username = '';
          this.password = '';
          this.router.navigate(['/chat']); // Navigate to chat after successful login
        },
        error: (error) => {
          this.toastService.show({
            template: this.errorTemplate,
            classname: 'bg-danger text-light',
            delay: 15000
          });
        }
      });
    } else {
      this.toastService.show({
        template: this.errorTemplate,
        classname: 'bg-danger text-light',
        delay: 15000,
        context: { message: 'Username and password are required.' }
      });
    }
  }

  openOffcanvas() {
    this.offcanvasRef = this.offcanvasService.open(this.offcanvasContent, { ariaLabelledBy: 'offcanvasNavbarLabel' });
  }

  closeOffcanvas() {
    if (this.offcanvasRef) {
      this.offcanvasRef.dismiss();
    }
  }

  onLogout() {
    this.authService.logout().subscribe(() => {
      console.log('User logged out');
    });
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forget-password']);
  }
}