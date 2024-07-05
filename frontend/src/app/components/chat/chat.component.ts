import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../chat.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';  // Add AuthService import
import { StorageService } from '../../storage.service';  // Import StorageService

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
    message: string = '';
    responses: any[] = [];
    username: string = '';

    constructor(private chatService: ChatService, private router: Router, private authService: AuthService, private storageService: StorageService) {}

    ngOnInit() {
        if (this.storageService.isLocalStorageAvailable()) {
            this.username = this.storageService.getItem('username')!;
            if (!this.username) {
                this.responses = [{text: 'Please log in to start your adventure.', from: 'bot'}];
                this.router.navigate(['/login']);
            } else {
                this.responses = [{text: `Welcome back, ${this.username}! Continue your adventure.`, from: 'bot'}];
            }
        } else {
            // Handle cases where localStorage is not available
            this.responses = [{text: 'LocalStorage is not available in this environment.', from: 'bot'}];
        }
    }

    sendMessage(): void {
        if (this.message.trim() === '') return;

        this.responses.push({text: this.message, from: 'user'});

        console.log('Sending message:', this.message);
        console.log('Username:', this.username);

        this.chatService.sendMessage(this.message, this.username).subscribe(response => {
            this.responses.push({text: response.text, from: 'bot'});
            this.message = '';
        }, error => {
            console.error('Error sending message:', error);
            this.responses.push({text: 'Error: Could not send message', from: 'bot'});
        });
    }

    onEnter(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    logout(): void {
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    }
