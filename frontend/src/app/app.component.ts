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
  private modalRef: NgbModalRef | null = null;
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
  @ViewChild('logoutSuccessTemplate', { static: true }) logoutSuccessTemplate!: TemplateRef<any>;

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
    this.modalRef = this.modalService.open(content);
  }

  confirmLogout() {
    const currentUsername = this.username; // Store the current username before logout
    this.authService.logout().subscribe(() => {
      console.log('User logged out');
      this.isLoggedIn = false;
      this.username = null;
      this.isSuperUser = false;
      this.router.navigate(['/homepage']);
      
      // Close the logout modal
      if (this.modalRef) {
        this.modalRef.close();
      }

      this.toastService.show({
        template: this.logoutSuccessTemplate,
        classname: 'bg-light-purple text-white',
        delay: 5000,
        context: { username: currentUsername, message: 'Bye for now , logout successful' }
      });
    });
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
      this.authService.login(this.username, this.password, this.rememberMe).subscribe({
        next: (response) => {
          this.toastService.show({
            template: this.welcomeTemplate,
            classname: 'bg-light-blue text-dark-blue',
            delay: 10000,
            context: { username: this.username }
          });
          if (this.rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          }
          modal.close('Login click');
          this.username = localStorage.getItem('username');
          this.password = '';
          this.isLoggedIn = true;
          this.isSuperUser = this.authService.isSuperUser();
          const targetRoute = this.isSuperUser ? '/super-profile' : '/#';
          this.router.navigate([targetRoute]);
        },
        error: (error) => {
          this.toastService.show({
            template: this.errorTemplate,
            classname: 'bg-danger text-light',
            delay: 15000,
            context: { message: error.message }
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

  togglePasswordVisibility(passwordFieldId: string, toggleIconId: string): void {
    const passwordField = document.getElementById(passwordFieldId) as HTMLInputElement;
    const toggleIcon = document.getElementById(toggleIconId) as HTMLElement;
    if (passwordField.type === 'password') {
      passwordField.type = 'text';
      toggleIcon.classList.remove('bi-eye-slash');
      toggleIcon.classList.add('bi-eye');
    } else {
      passwordField.type = 'password';
      toggleIcon.classList.remove('bi-eye');
      toggleIcon.classList.add('bi-eye-slash');
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
      this.rememberMe = false;
      this.router.navigate(['/homepage']);
    });
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forget-password']);
  }

  navigateToHomepage() {
    this.router.navigate(['/homepage']);
  }

  navigateToRoute(route: string) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate([route]);
    } else {
      // Save the route in session storage
      sessionStorage.setItem('intendedRoute', route);
      this.router.navigate(['/login']);
    }
  }
}
