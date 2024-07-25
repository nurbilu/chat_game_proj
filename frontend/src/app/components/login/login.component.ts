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

    constructor(private authService: AuthService, private router: Router, private toastService: ToastService) { }

    login() {
        this.authService.login(this.username, this.password).subscribe({
            next: (response) => {
                localStorage.setItem('username', this.username); // Store username in local storage
                this.router.navigate(['/chat']);
                if (this.username) {
                    this.toastService.show({
                        template: this.welcomeTemplate,
                        classname: 'bg-success text-light',
                        delay: 10000,
                        context: { username: this.username }
                    });
                }
                this.username = '';
                this.password = '';
            },
            error: (error) => {
                this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
            }
        });
    }


    logout(): void {
        const username = localStorage.getItem('username'); // Pull username from local storage
        console.log('Passing username to toast:', username);
        this.toastService.show({
            template: this.logoutTemplate,
            classname: 'bg-success text-light',
            delay: 10000,
            context: { username }
        });
        localStorage.clear();
        this.router.navigate(['/login']);
        this.toastService.show({ template: this.successTemplate, classname: 'bg-success text-light', delay: 10000 });
        this.toastService.show({ template: this.logoutTemplate, classname: 'bg-success text-light', delay: 10000, context: { username } });
    }
}