import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    username: string = '';
    password: string = '';

    @ViewChild('successTemplate', { static: true }) successTemplate!: TemplateRef<any>;
    @ViewChild('errorTemplate', { static: true }) errorTemplate!: TemplateRef<any>;
    @ViewChild('logoutTemplate', { static: true }) logoutTemplate!: TemplateRef<any>;
    @ViewChild('welcomeTemplate', { static: true }) welcomeTemplate!: TemplateRef<any>;

    constructor(
        private authService: AuthService,
        private router: Router,
        private toastService: ToastService
    ) { }

    login() {
        this.authService.login(this.username, this.password).subscribe({
            next: () => {
                // Success handled by AuthService
            },
            error: (err) => {
                console.error('Login failed', err);
                this.toastService.show({
                    template: this.errorTemplate,
                    classname: 'bg-danger text-light',
                    delay: 15000
                });
            }
        });
    }

    navigateToForgotPassword(): void {
        this.router.navigate(['/forget-password']);
    }
}