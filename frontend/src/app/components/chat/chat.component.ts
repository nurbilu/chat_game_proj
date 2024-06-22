import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { ChatService } from '../../chat.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent {
    message: string = '';
    responses: any[] = [];

    constructor(private authService: AuthService, private chatService: ChatService, private router: Router) { } // Inject ChatService and Router

    ngOnInit() {
        // Assuming this method is part of your component lifecycle
        this.responses = ['Welcome to Chat'];  // Set a default message to display
    }

    sendMessage(): void {
        this.chatService.sendMessage(this.message).subscribe(response => {
            this.responses.push(response);
            this.message = ''; // Clear the message input after sending
        });
    }

    logout(): void {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
    }
}
