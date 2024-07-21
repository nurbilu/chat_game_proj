import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
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
    profilePicture: File | null = null;

    constructor(private authService: AuthService, private router: Router) { }

    register() {
        const formData = new FormData();
        formData.append('username', this.username);
        formData.append('password', this.password);
        formData.append('email', this.email);
        formData.append('address', this.address);
        formData.append('birthdate', this.birthdate);
        if (this.profilePicture) {
            formData.append('profile_picture', this.profilePicture);
        }

        this.authService.register(formData).subscribe(
            data => {
                this.router.navigate(['/login']);
            },
            error => {
                console.error('Registration failed', error);
            }
        );
    }

    onFileSelected(event: any): void {
        this.profilePicture = event.target.files[0];
    }

    logout(): void {
        // localStorage.removeItem('token');
        localStorage.clear();
        this.router.navigate(['/login']);
    }
}