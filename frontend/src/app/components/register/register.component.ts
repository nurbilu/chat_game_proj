import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    username: string = '';
    password: string = '';
    email: string = '';
    address: string = '';
    birthdate: string = '';

    constructor(private authService: AuthService, private router: Router) { }

    register() {
        this.authService.register(this.username, this.password, this.email, this.address, this.birthdate).subscribe(
            data => {
                this.router.navigate(['/login']);
            },
            error => {
                console.error('Registration failed', error);
            }
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
    }
}
