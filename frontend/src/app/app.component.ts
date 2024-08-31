import { Component, OnInit, TemplateRef, ViewChild, NgZone, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NgbOffcanvas, NgbOffcanvasRef, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from './services/toast.service';
import { AuthService } from './services/auth.service';
import { ChrcterCreationComponent } from './components/chrcter-creation/chrcter-creation.component';

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
  rememberMe: boolean = false;
  private modalRef: NgbModalRef | undefined;
  isNavbarSticky: boolean = false;
  isLoading: boolean = false;

  @ViewChild('offcanvasContent', { static: true }) offcanvasContent!: TemplateRef<any>;
  @ViewChild('logoutTemplate', { static: true }) logoutTemplate!: TemplateRef<any>;
  @ViewChild('loginTemplate', { static: true }) loginTemplate!: TemplateRef<any>;
  @ViewChild('welcomeTemplate', { static: true }) welcomeTemplate!: TemplateRef<any>;
  @ViewChild('errorTemplate', { static: true }) errorTemplate!: TemplateRef<any>;
  @ViewChild('successTemplate', { static: true }) successTemplate!: TemplateRef<any>;
  private offcanvasRef!: NgbOffcanvasRef;
  isLoggedIn: boolean = false;
  @ViewChild(ChrcterCreationComponent) chrcterCreationComponent!: ChrcterCreationComponent;

  constructor(
    private router: Router,
    private offcanvasService: NgbOffcanvas,
    private toastService: ToastService,
    private authService: AuthService,
    private ngZone: NgZone,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.authService.getUsername().subscribe(username => {
          this.username = username;
          this.isSuperUser = this.authService.isSuperUser();
        });
      }
    });

  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isNavbarSticky = window.pageYOffset > 0;
  }

  alert(message: string) {
    alert(message);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      localStorage.clear();
      if (this.chrcterCreationComponent) {
        this.chrcterCreationComponent.clearEditor();
      }
      this.router.navigate(['/homepage']);
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

  loginWithModal(modal: any) {
    if (this.username && this.password) {
      this.isLoading = true;
      this.authService.loginForModal(this.username, this.password, this.rememberMe).subscribe({
        next: (response) => {
          this.toastService.show({
            template: this.welcomeTemplate,
            classname: 'bg-success text-light',
            delay: 10000,
            context: { username: this.username }
          });
          modal.close('Login click');
          this.username = localStorage.getItem('username');
          this.password = '';
          this.isLoggedIn = true;
          this.isSuperUser = this.authService.isSuperUser();
          if (this.rememberMe) {
            this.authService.rememberMe();
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.toastService.show({
            template: this.errorTemplate,
            classname: 'bg-danger text-light',
            delay: 15000,
            context: { message: error.message }
          });
          this.isLoading = false;
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
    this.offcanvasRef = this.offcanvasService.open(this.offcanvasContent, {
      ariaLabelledBy: 'offcanvasNavbarLabel',
      scroll: true,
      backdrop: true
    });
  }

  closeOffcanvas() {
    if (this.offcanvasRef) {
      this.offcanvasRef.dismiss();
    }
  }

  onLogout() {
    this.authService.logout().subscribe(() => {
      console.log('User logged out');
      this.isLoggedIn = false;
      this.username = null;
      this.isSuperUser = false;
      this.router.navigate(['/homepage']);
    });
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forget-password']);
  }
}