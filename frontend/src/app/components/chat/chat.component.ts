import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../chat.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
    message: string = '';
    responses: any[] = [];
    username: string = '';
    token: string | null = null;
    gameStarted: boolean = false;

    constructor(private chatService: ChatService, private router: Router) {}

    ngOnInit() {
        this.token = localStorage.getItem('token');
        if (this.token) {
            this.responses = [{text: 'Welcome back! Continue your adventure.', from: 'bot'}];
        } else {
            this.responses = [{text: 'Please log in to start your adventure.', from: 'bot'}];
            this.router.navigate(['/login']);
        }
    }

    sendMessage(): void {
        if (this.message.trim() === '') return;

        this.responses.push({text: this.message, from: 'user'});

        this.chatService.sendMessage(this.message, this.username, this.token!).subscribe(response => {
            this.responses.push({text: response.text, from: 'bot'});
            
            if (!this.username) {
                this.username = 'User'; // Default username if not set
            }
            
            if (response.text.includes("Are you ready to start your adventure?")) {
                this.gameStarted = true;
            }
            
            this.message = '';
        }, error => {
            this.responses.push({text: 'Error: Could not send message', from: 'bot'});
        });
    }
}
