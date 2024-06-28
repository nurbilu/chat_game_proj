import { Component } from '@angular/core';
import { ChatService } from '../../chat.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent {
    message: string = '';
    responses: any[] = [];

    constructor(private chatService: ChatService) {}

    ngOnInit() {
        this.responses = [{text: 'Welcome to Chat'}];  // Set a default message to display
    }

    sendMessage(): void {
        // Add user's message to responses array
        this.responses.push({text: this.message, from: 'user'});

        this.chatService.sendMessage(this.message).subscribe(response => {
            // Add API response to responses array
            this.responses.push({text: response.text, from: 'bot'});
            this.message = ''; // Clear the message input after sending
        }, error => {
            this.responses.push({text: 'Error: Could not send message', from: 'bot'});
        });
    }
}
