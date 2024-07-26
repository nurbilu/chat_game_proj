import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
    message: string = '';
    responses: any[] = [];
    username: string = '';

    constructor(private chatService: ChatService, private router: Router, private authService: AuthService, private storageService: StorageService) { }

    ngOnInit() {
        this.authService.isLoggedIn.subscribe(isLoggedIn => {
            if (isLoggedIn) {
                this.username = localStorage.getItem('username')!;
                if (!this.username) {
                    this.responses = [{ text: 'Please log in to start your adventure.', from: 'bot' }];
                    this.router.navigate(['/login']);
                } else {
                    this.responses = [{ text: `Welcome back, ${this.username}! Continue your adventure.`, from: 'bot' }];
                }
            } else {
                this.responses = [{ text: 'Please log in to start your adventure.', from: 'bot' }];
                this.router.navigate(['/login']);
            }
        });
    }

    sendMessage(): void {
        if (this.message.trim() === '') return;

        this.responses.push({ text: this.message, from: 'user' });

        this.chatService.sendMessage(this.message, this.username).subscribe({
            next: (response) => {
                this.responses.push({ text: response.text, from: 'bot' });
                this.message = '';
            },
            error: (error) => {
                console.error('Error sending message:', error);
                this.responses.push({ text: 'Error: Could not send message', from: 'bot' });
            }
        });
    }

    onEnter(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    logout(): void {
        this.authService.logout().subscribe(() => {
            this.router.navigate(['/homepage']);
        });
    }
}