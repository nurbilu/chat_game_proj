import { Component, TemplateRef, ViewChild, NgZone } from '@angular/core';
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
        private toastService: ToastService,
        private ngZone: NgZone
    ) { }

    login() {
        const user = {
            username: this.username,
            password: this.password
        };

        this.authService.login(user.username, user.password).subscribe({
            next: () => {
                this.router.navigate(['/']).then(() => {
                    window.location.reload();
                });
            },
            error: (err) => {
                console.error('Login failed', err);
            }
        });
    }

    navigateToForgotPassword(): void {
        this.router.navigate(['/forget-password']);
    }
}