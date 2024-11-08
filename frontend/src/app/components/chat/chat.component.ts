import { Component, OnInit, TemplateRef } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { ChcrcterCreationService } from '../../services/chcrcter-creation.service';
import { ToastService } from '../../services/toast.service';

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
    profilePictureUrl: string = '';
    isDropupOpen = false;
    showEditor: boolean = false;
    showStaticHoverCard = false;
    selectedEntry: any = null;
    activeFormats: Set<string> = new Set();

    editorConfig = {
        menubar: false,
        toolbar_location: "top",
        plugins: "link lists emoticons",
        toolbar: [
            'bold italic underline | forecolor | alignleft aligncenter alignright | bullist numlist | emoticons'
        ],
        skin: "oxide-dark",
        icons: "small",
        height: "auto",
        resize: false
    };
    errorTemplate: TemplateRef<any> | undefined;

    private isResizing = false;
    private startY = 0;
    private startHeight = 0;

    constructor(private chatService: ChatService, private router: Router, private authService: AuthService, private storageService: StorageService, private chcrcterCreationService: ChcrcterCreationService, private toastService: ToastService) { }

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
                this.authService.getUserProfile(this.username).subscribe({
                    next: (data) => {
                        if (data.profile_picture) {
                            this.profilePictureUrl = `http://127.0.0.1:8000${data.profile_picture}`;
                        }
                    },
                    error: (error) => {
                        console.error('Error fetching profile picture:', error);
                    }
                });
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

        // Add resize event listeners
        const chatInput = document.querySelector('.chat-input') as HTMLTextAreaElement;
        
        chatInput?.addEventListener('mousedown', (e: MouseEvent) => {
            // Only trigger if clicking near the top border (within 4px)
            if (e.offsetY <= 4) {
                this.isResizing = true;
                this.startY = e.clientY;
                this.startHeight = chatInput.offsetHeight;
                chatInput.classList.add('resizing');
                
                // Prevent text selection
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e: MouseEvent) => {
            if (!this.isResizing) return;
            
            const deltaY = this.startY - e.clientY;
            const newHeight = Math.max(50, this.startHeight + deltaY); // Minimum height of 50px
            
            chatInput.style.height = `${newHeight}px`;
        });

        document.addEventListener('mouseup', () => {
            if (this.isResizing) {
                this.isResizing = false;
                chatInput?.classList.remove('resizing');
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
            if (event.shiftKey) {
                // Allow default behavior (new line) when Shift+Enter is pressed
                return;
            } else {
                // Prevent default behavior and send message when only Enter is pressed
                event.preventDefault();
                this.sendMessage();
            }
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

    toggleDropup() {
        this.isDropupOpen = !this.isDropupOpen;
    }

    selectOption(option: string) {
        this.selectedTemplate = option;
        this.isDropupOpen = false;
        this.pasteTemplate();
    }

    toggleEditor(): void {
        this.showEditor = !this.showEditor;
    }

    formatText(command: string, value: string | null = null): void {
        const textarea = document.querySelector('.chat-input') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = this.message.substring(start, end);

        if (start === end) {
            // Toggle format state even without selection
            this.toggleFormat(command, value);
            return;
        }

        let formattedText = '';
        switch (command) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                this.toggleFormat('bold');
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                this.toggleFormat('italic');
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                this.toggleFormat('underline');
                break;
            case 'align':
                formattedText = `<div style="text-align: ${value}">${selectedText}</div>`;
                this.toggleFormat('align', value);
                break;
            case 'list':
                const lines = selectedText.split('\n');
                if (value === 'bullet') {
                    formattedText = lines.map(line => `• ${line}`).join('\n');
                } else {
                    formattedText = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
                }
                this.toggleFormat('list', value);
                break;
        }

        // Replace the selected text with the formatted text
        this.message = this.message.substring(0, start) + formattedText + this.message.substring(end);
        
        // Restore cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start, start + formattedText.length);
        }, 0);
    }

    private toggleFormat(format: string, value: string | null = null): void {
        const formatKey = value ? `${format}-${value}` : format;
        if (this.activeFormats.has(formatKey)) {
            this.activeFormats.delete(formatKey);
        } else {
            // For alignment, remove other alignment options first
            if (format === 'align') {
                ['align-left', 'align-center', 'align-right'].forEach(f => this.activeFormats.delete(f));
            }
            // For lists, remove other list options first
            if (format === 'list') {
                ['list-bullet', 'list-number'].forEach(f => this.activeFormats.delete(f));
            }
            this.activeFormats.add(formatKey);
        }
        
        // Apply formatting after toggling
        this.applyFormatting();
    }

    showCharacterPromptHover(): void {
        this.authService.getUsername().subscribe((username: string) => {
            this.chcrcterCreationService.getCharacterPrompt(username).subscribe({
                next: (response) => {
                    const promptText = response.characterPrompt || '';
                    const promptData = this.parsePromptToTableData(promptText);
                    
                    this.selectedEntry = {
                        name: 'Saved Character Prompt',
                        promptData: promptData
                    };
                    this.showStaticHoverCard = true;
                    document.body.classList.add('modal-open');
                },
                error: (error) => {
                    console.error('Failed to fetch character prompt:', error);
                    this.toastService.show({
                        template: this.errorTemplate,
                        classname: 'bg-danger text-light',
                        delay: 3000,
                        context: { message: 'Failed to load character prompt' }
                    });
                }
            });
        });
    }

    closeStaticHoverCard(): void {
        this.showStaticHoverCard = false;
        this.selectedEntry = null;
        document.body.classList.remove('modal-open');
    }

    private parsePromptToTableData(promptText: string): Array<{field: string, value: string}> {
        const fields = ['character name', 'race', 'class', 'subclass', 'level', 'spells', 'equipment'];
        const result = [];
        
        for (const field of fields) {
            const regex = new RegExp(`${field}:\\s*([^\\n]+)`, 'i');
            const match = promptText.match(regex);
            result.push({
                field: field.charAt(0).toUpperCase() + field.slice(1),
                value: match ? match[1].trim() : ''
            });
        }
        
        return result;
    }

    // Add this method to apply formatting to the input text
    private applyFormatting(): void {
        const textarea = document.querySelector('.chat-input') as HTMLTextAreaElement;
        if (!textarea) return;

        // Create a temporary div to hold the formatted text
        const tempDiv = document.createElement('div');
        let formattedText = this.message;

        // Apply active formats
        this.activeFormats.forEach(format => {
            switch (format) {
                case 'bold':
                    formattedText = `<strong>${formattedText}</strong>`;
                    break;
                case 'italic':
                    formattedText = `<em>${formattedText}</em>`;
                    break;
                case 'underline':
                    formattedText = `<u>${formattedText}</u>`;
                    break;
                case 'align-left':
                    formattedText = `<div style="text-align: left">${formattedText}</div>`;
                    break;
                case 'align-center':
                    formattedText = `<div style="text-align: center">${formattedText}</div>`;
                    break;
                case 'align-right':
                    formattedText = `<div style="text-align: right">${formattedText}</div>`;
                    break;
            }
        });

        // Update the textarea's content
        tempDiv.innerHTML = formattedText;
        textarea.style.fontWeight = this.activeFormats.has('bold') ? 'bold' : 'normal';
        textarea.style.fontStyle = this.activeFormats.has('italic') ? 'italic' : 'normal';
        textarea.style.textDecoration = this.activeFormats.has('underline') ? 'underline' : 'none';
        textarea.style.textAlign = 
            this.activeFormats.has('align-right') ? 'right' : 
            this.activeFormats.has('align-center') ? 'center' : 
            'left';
    }

    // Add this to handle input changes
    onInputChange(): void {
        this.applyFormatting();
    }

    // Add this method to reset all formatting
    resetFormatting(): void {
        this.activeFormats.clear();
        this.applyFormatting();
    }

}
