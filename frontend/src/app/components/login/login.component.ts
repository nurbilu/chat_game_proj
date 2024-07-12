import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
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
        this.authService.login(this.username, this.password).subscribe({
            next: (response) => {
                this.router.navigate(['/chat']); 
                console.log('Login successful');
            },
            error: (error) => {
                console.error('Login failed');
            }
        });
    }

    logout(): void {
        localStorage.clear();
        this.router.navigate(['/login']);
    }
}
