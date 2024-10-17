import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

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
    firstName: string = '';
    lastName: string = '';
    profilePicture: File | null = null;

    @ViewChild('successTemplate', { static: true }) successTemplate!: TemplateRef<any>;
    @ViewChild('errorTemplate', { static: true }) errorTemplate!: TemplateRef<any>;

    constructor(private authService: AuthService, private router: Router, private toastService: ToastService) { }

    register() {
        if (!this.profilePicture) {
            this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
            return;
        }

        const formData = new FormData();
        formData.append('username', this.username);
        formData.append('password', this.password);
        formData.append('email', this.email);
        formData.append('address', this.address);
        formData.append('birthdate', this.birthdate);
        formData.append('first_name', this.firstName);
        formData.append('last_name', this.lastName);
        formData.append('profile_picture', this.profilePicture);

        this.authService.register(formData).subscribe(
            data => {
                this.router.navigate(['/login']);
                this.toastService.show({ template: this.successTemplate, classname: 'bg-success text-light', delay: 10000 });
                this.username = '';
                this.password = '';
                this.email = '';
                this.address = '';
                this.birthdate = '';
                this.firstName = '';
                this.lastName = '';
                this.profilePicture = null;
            },
            error => {
                this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
            }
        );
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.profilePicture = file;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const previewHolder = document.getElementById('previewHolder') as HTMLImageElement;
                previewHolder.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    logout(): void {
        localStorage.clear();
        this.router.navigate(['/homepage']);
    }
}
