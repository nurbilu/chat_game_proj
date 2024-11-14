import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    username: string = '';
    password: string = '';
    rememberMe: boolean = false;
    returnUrl: string = '/';
    passwordVisible = false;

    @ViewChild('successTemplate', { static: true }) successTemplate!: TemplateRef<any>;
    @ViewChild('errorTemplate', { static: true }) errorTemplate!: TemplateRef<any>;
    @ViewChild('logoutTemplate', { static: true }) logoutTemplate!: TemplateRef<any>;
    @ViewChild('welcomeTemplate', { static: true }) welcomeTemplate!: TemplateRef<any>;

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private toastService: ToastService
    ) {
        // Get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    login() {
        if (this.username && this.password) {
            this.authService.login(this.username, this.password, this.rememberMe).subscribe({
                next: (response) => {
                    this.toastService.show({
                        template: this.welcomeTemplate,
                        classname: 'bg-light-blue text-dark-blue',
                        delay: 3000,
                        context: { username: this.username }
                    });
                    
                    // Get the intended route from session storage
                    const intendedRoute = sessionStorage.getItem('intendedRoute') || '/';
                    
                    // Clear the intended route from session storage
                    sessionStorage.removeItem('intendedRoute');
                    
                    // Navigate to the intended route
                    this.router.navigate([intendedRoute]);
                },
                error: (error) => {
                    console.error('Login error:', error);
                    this.toastService.show({
                        template: this.errorTemplate,
                        classname: 'bg-danger text-light',
                        delay: 5000,
                        context: { message: 'Invalid username or password.' }
                    });
                }
            });
        } else {
            this.toastService.show({
                template: this.errorTemplate,
                classname: 'bg-danger text-light',
                delay: 7000,
                context: { message: 'Username and password are required.' }
            });
        }
    }

    navigateToForgotPassword(): void {
        this.router.navigate(['/forget-password']);
    }

    togglePasswordVisibility(): void {
        this.passwordVisible = !this.passwordVisible;
    }
}
