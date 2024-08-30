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
        this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
            if (!isLoggedIn) {
                this.router.navigate(['/login']);
                return;
            }
            this.username = localStorage.getItem('username')!;
            if (!this.username) {
                this.responses = [{ text: 'Please log in to start your adventure.', from: 'bot' }];
                this.router.navigate(['/login']);
            } else {
                this.responses = [{ text: `Welcome back, ${this.username}! Continue your adventure.`, from: 'bot' }];
                // Load session data
                this.chatService.sendMessage('', this.username).subscribe({
                    next: (response) => {
                        if (response.last_prompt) {
                            this.responses.push({ text: `Last prompt: ${response.last_prompt}`, from: 'bot' });
                            this.responses.push({ text: `Last response: ${response.last_response}`, from: 'bot' });
                        }
                    },
                    error: (error) => {
                        console.error('Error loading session:', error);
                    }
                });
            }
        });
    }

    sendMessage(): void {
        if (this.message.trim() === '') return;

        this.responses.push({ text: this.message, from: 'user' });

        this.chatService.sendMessage(this.message, this.username).subscribe({
            next: (response) => {
                this.responses.push({ text: response.response, from: 'bot' });
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

    pasteTemplate(): void {
        this.chatService.getCharacterPrompt(this.username).subscribe({
            next: (response) => {
                this.message = `I want to create a character, you choose all options I mention as so: ${response.characterPrompt}`;
            },
            error: (error) => {
                console.error('Error fetching character prompt:', error);
                this.responses.push({ text: 'Error: Could not fetch character prompt', from: 'bot' });
            }
        });
    }
}