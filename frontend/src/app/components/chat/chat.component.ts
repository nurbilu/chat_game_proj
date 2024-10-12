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
    selectedTemplate: any;
    diceTypes: string[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
    selectedDice: string[] = ['d20'];
    numDice: number[] = [1];
    modifiers: number[] = [0];
    rollResults: number[] = [];
    rollTotal: number = 0;
    additionalModifiers: number[] = [];
    profilePictureUrl: string = '/assets/imgs/default-profile.png'; // Default profile picture

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
                        }
                    },
                    error: (error) => {
                        console.error('Error fetching session data:', error);
                    }
                });
            }
        });

        this.authService.getUserProfile().subscribe(profile => {
            this.profilePictureUrl = profile.profilePictureUrl || '/assets/imgs/default-profile.png';
            console.log('Profile Picture URL:', this.profilePictureUrl); // Debugging line
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
        let templateMessage = '';
        switch (this.selectedTemplate) {
            case 'template1':
                templateMessage = `Hello, my name is ${this.username}. I want to start a game. If you want me to give you information for creating a character, I'll gladly send you my pre-made character prompt.`;
                break;
            case 'template2':
                this.chatService.getCharacterPrompt(this.username).subscribe({
                    next: (response) => {
                        this.message = `Character Prompt: ${response.characterPrompt}`;
                    },
                    error: (error) => {
                        console.error('Error fetching character prompt:', error);
                        this.responses.push({ text: 'Error: Could not fetch character prompt', from: 'bot' });
                    }
                });
                return; // Exit the function to avoid setting the message again
            case 'template3':
                templateMessage = 'Save last prompt to know from where to continue.';
                break;
            default:
                templateMessage = '';
        }
        this.message = templateMessage;
    }

    clearChatInput(): void {
        this.message = '';
    }

    addDiceType(): void {
        this.selectedDice.push('d20');
        this.numDice.push(1);
        this.modifiers.push(0);
    }

    clearRollResults(): void {
        this.rollResults = [];
        this.rollTotal = 0;
    }

    rollDice(): void {
        const totalModifier = this.modifiers.reduce((acc, mod) => acc + mod, 0);
        this.chatService.rollDice(this.selectedDice, this.numDice, totalModifier).subscribe({
            next: (response) => {
                this.rollResults = response.results;
                this.rollTotal = response.total;
            },
            error: (error) => {
                console.error('Error rolling dice:', error);
                this.rollResults = [];
                this.rollTotal = 0;
            }
        });
    }

    GoToProfile(): void {
        this.router.navigate(['/profile']);
        this.username = localStorage.getItem('username')!;
        this.profilePictureUrl = localStorage.getItem('profilePictureUrl')!;
    }

    resetDiceRoller(): void {
        this.selectedDice = ['d20'];
        this.numDice = [1];
        this.modifiers = [0];
        this.rollResults = [];
        this.rollTotal = 0;
        this.additionalModifiers = [];
    }
}
