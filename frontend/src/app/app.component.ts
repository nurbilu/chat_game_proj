import { Component, OnInit, TemplateRef, ViewChild, NgZone, HostListener, ElementRef } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
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
  navigateToLoginpage() {
    this.router.navigate(['/login']);
  }
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
  private offcanvasRef: NgbOffcanvasRef | null = null; // Allow null as a type
  isLoggedIn: boolean = false;
  @ViewChild(ChrcterCreationComponent) chrcterCreationComponent!: ChrcterCreationComponent;
  @ViewChild('logoutSuccessTemplate', { static: true }) logoutSuccessTemplate!: TemplateRef<any>;
  @ViewChild('draggableOffcanvas', { static: true }) draggableOffcanvas!: ElementRef;

  currentOffcanvasPosition: 'top' | 'bottom' | 'start' | 'end' = 'start'; // Default position
  private defaultPosition: 'top' | 'bottom' | 'start' | 'end' = 'start';
  private clickCount: number = 0;
  private clickTimer: any;

  profilePictureUrl: string | null = null;

  modalPasswordVisible = false;

  currentRoute: string = '';

  private profileClickCount: number = 0;
  private profileClickTimer: any;

  superUserImageUrl: string = 'http://127.0.0.1:8000/media/super-user-pic/Super-Pic.png';

  constructor(
    private router: Router,
    private offcanvasService: NgbOffcanvas,
    private toastService: ToastService,
    private authService: AuthService,
    private ngZone: NgZone,
    private modalService: NgbModal
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.authService.getUsername().subscribe(username => {
          this.username = username;
          this.isSuperUser = this.authService.isSuperUser();
        });
        
        this.authService.getCurrentUser().subscribe(data => {
          if (data && data.profile_picture) {
            this.profilePictureUrl = `http://127.0.0.1:8000${data.profile_picture}`;
          } else {
            this.profilePictureUrl = 'http://127.0.0.1:8000/profile_pictures/default.png';
          }
        });
      }
    });

    if (this.draggableOffcanvas?.nativeElement) {
      this.makeOffcanvasDraggable();
    }
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

  toggleOffcanvasPosition(position: 'top' | 'bottom' | 'start' | 'end') {
    this.currentOffcanvasPosition = position;
    this.openOffcanvas();
  }

  openOffcanvas() {
    if (this.offcanvasRef) {
      this.closeOffcanvas();
    }
    
    const options = {
      position: this.currentOffcanvasPosition,
      backdrop: true,
      keyboard: true
    };
    
    this.offcanvasRef = this.offcanvasService.open(this.offcanvasContent, options);
    
    this.offcanvasRef.dismissed.subscribe(() => {
      this.offcanvasRef = null;
    });
  }

  closeOffcanvas() {
    if (this.offcanvasRef) {
      this.offcanvasRef.dismiss();
      this.offcanvasRef = null; // Reset the reference
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

  makeOffcanvasDraggable() {
    const offcanvasElement = this.draggableOffcanvas.nativeElement;
    let isDragging = false;
    let startX: number, startY: number, initialX: number, initialY: number;

    offcanvasElement.addEventListener('mousedown', (event: MouseEvent) => {
      isDragging = true;
      startX = event.clientX;
      startY = event.clientY;
      initialX = offcanvasElement.offsetLeft;
      initialY = offcanvasElement.offsetTop;
      event.preventDefault();
    });

    document.addEventListener('mousemove', (event: MouseEvent) => {
      if (isDragging) {
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        offcanvasElement.style.left = `${initialX + dx}px`;
        offcanvasElement.style.top = `${initialY + dy}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  startDragging(event: MouseEvent) {
    event.preventDefault();
    
    const toggleElement = event.target as HTMLElement;
    const startX = event.clientX;
    const startY = event.clientY;
    let isDragging = false;
    const dragThreshold = 10;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      if (!isDragging && (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold)) {
        isDragging = true;
        toggleElement.classList.add('dragging');
      }

      if (isDragging) {
        // Update icon position to follow cursor
        toggleElement.style.left = `${moveEvent.clientX}px`;
        toggleElement.style.top = `${moveEvent.clientY}px`;

        // Determine position based on the largest movement axis
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal movement
          if (dx > 0) {
            this.currentOffcanvasPosition = 'end';
            toggleElement.className = 'toggle-offcanvas-icon dragging end';
          } else {
            this.currentOffcanvasPosition = 'start';
            toggleElement.className = 'toggle-offcanvas-icon dragging start';
          }
        } else {
          // Vertical movement
          if (dy > 0) {
            this.currentOffcanvasPosition = 'bottom';
            toggleElement.className = 'toggle-offcanvas-icon dragging bottom';
          } else {
            this.currentOffcanvasPosition = 'top';
            toggleElement.className = 'toggle-offcanvas-icon dragging top';
          }
        }
      }
    };

    const onMouseUp = () => {
      toggleElement.classList.remove('dragging');
      
      if (isDragging) {
        this.openOffcanvas();
      } else {
        this.toggleOffcanvas();
      }

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  toggleOffcanvas() {
    if (this.offcanvasRef) {
      this.closeOffcanvas();
    } else {
      this.openOffcanvas();
    }
  }

  handleLogoClick() {
    this.clickCount++;
    
    if (this.clickTimer) {
      clearTimeout(this.clickTimer);
    }
    
    this.clickTimer = setTimeout(() => {
      if (this.clickCount === 2) {
        // Double click detected - reset position
        this.currentOffcanvasPosition = this.defaultPosition;
        this.openOffcanvas();
      } else if (this.clickCount === 1) {
        // Single click - just open offcanvas
        this.openOffcanvas();
      }
      this.clickCount = 0;
    }, 250); // Adjust timing as needed
  }

  toggleModalPasswordVisibility(): void {
    this.modalPasswordVisible = !this.modalPasswordVisible;
  }

  saveNavLinkToCookies(url: string): void {
    sessionStorage.setItem('lastNavLink', url);
    
    if (!this.isLoggedIn && this.requiresAuthRoute(url)) {
      this.router.navigate(['/login']);
      this.closeOffcanvas();
    } else {
      this.router.navigate([url]);
      this.closeOffcanvas();
    }
  }

  private requiresAuthRoute(route: string): boolean {
    const protectedRoutes = [
      '/chat',
      '/profile',
      '/change-password',
      '/character-creation',
      '/super-profile'
    ];
    return protectedRoutes.includes(route);
  }

  isProfileOrChatRoute(): boolean {
    return ['/profile', '/chat'].includes(this.currentRoute);
  }

  navigateToChat(): void {
    if (!this.isLoggedIn) return;

    this.profileClickCount++;
    
    if (this.profileClickTimer) {
      clearTimeout(this.profileClickTimer);
    }
    
    this.profileClickTimer = setTimeout(() => {
      if (this.profileClickCount === 2) {
        // Double click - conditional navigation
        if (this.currentRoute === '/character-creation') {
          this.router.navigate(['/profile']);
        }
        else if (this.currentRoute === '/profile') {
          this.router.navigate(['/library']);
        }
        else {
          this.router.navigate(['/character-creation']);
        }
      } else if (this.profileClickCount === 1) {
        // Single click - navigate to chat
        this.router.navigate(['/chat']);
      }
      this.profileClickCount = 0;
    }, 250);
  }

  navigateToProfile(): void {
    if (!this.isLoggedIn) return;

    if (this.currentRoute === '/profile') {
      this.router.navigate(['/character-creation']);
    }
    else if (this.currentRoute === '/character-creation') {
      this.router.navigate(['/library']);
    } 
     else {
      this.router.navigate(['/profile']);
    }
  }

  navigateToCharacterCreation(): void {
    if (!this.isLoggedIn) return;
    this.router.navigate(['/character-creation']);
  }
}
