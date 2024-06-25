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
        this.chatService.sendMessage(this.message).subscribe(response => {
            this.responses.push(response);
            this.message = ''; // Clear the message input after sending
        }, error => {
            this.responses.push({text: 'Error: Could not send message'});
        });
    }
}
