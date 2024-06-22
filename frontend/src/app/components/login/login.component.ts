import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    username: string = '';
    password: string = '';

    constructor(private authService: AuthService, private router: Router) { }

    login() {
        this.authService.login(this.username, this.password).subscribe(
            data => {
                localStorage.setItem('token', data.access);  // Assuming JWT returns an 'access' token
                if (data.isSuperuser) {
                    this.router.navigate(['/profile']);  // Navigate to profile route if superuser
                } else {
                    this.router.navigate(['/profile']);  // Navigate to the same profile route for simplicity
                }
            },
            error => {
                console.error('Login failed', error);
            }
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
    }
}
