import { Component, OnInit, TemplateRef, HostListener } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { ChcrcterCreationService, Character } from '../../services/chcrcter-creation.service';
import { ToastService } from '../../services/toast.service';

interface PromptDataItem {
    field: string;
    value: string;
    expanded?: boolean;
}

interface CharacterPromptDisplay {
    field: string;
    value: string;
    expanded?: boolean;
}

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
    superUserImageUrl: string = 'http://127.0.0.1:8000/media/super-user-pic/Super-Pic.png';
    defaultProfilePicture: string = 'assets/default-profile.png';
    userProfilePicture: string | null = null;
    isCharacterDropupOpen = false;
    characterPrompts: Character[] = [];
    promptData: PromptDataItem[] = [];
    selectedCharacterPrompt: Character | null = null;
    selectedCharacterPromptdata: any = null;
    isCollapsed = true;

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

    displayFields: string[] = [
        'Character Name',
        'Race',
        'Class',
        'Subclass',
        'Background',
        'Level',
        'Ability Scores',
        'Skills',
        'Spells',
        'Class Abilities',
        'Equipment',
        'Character Traits',
        'Ideals',
        'Bonds',
        'Flaws'
    ];

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
            this.loadCharacterPrompts();
        });

        const chatInput = document.querySelector('.chat-input') as HTMLTextAreaElement;
        
        chatInput?.addEventListener('mousedown', (e: MouseEvent) => {
            const rect = chatInput.getBoundingClientRect();
            const isInResizeZone = e.clientY - rect.top <= 8; 
            
            if (isInResizeZone) {
                this.isResizing = true;
                this.startY = e.clientY;
                this.startHeight = chatInput.offsetHeight;
                
                chatInput.classList.add('resizing');
                
                const onMouseMove = (moveEvent: MouseEvent) => {
                    if (!this.isResizing) return;
                    
                    const deltaY = this.startY - moveEvent.clientY;
                    const newHeight = Math.max(50, this.startHeight + deltaY);
                    
                    requestAnimationFrame(() => {
                        chatInput.style.height = `${newHeight}px`;
                    });
                };
                
                const onMouseUp = () => {
                    if (this.isResizing) {
                        this.isResizing = false;
                        chatInput.classList.remove('resizing');
                        
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    }
                };
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                
                e.preventDefault();
            }
        });

        this.authService.getCurrentUser().subscribe({
            next: (user) => {
                this.userProfilePicture = user.profile_picture;
                this.username = user.username;
            },
            error: (error) => {
                console.error('Error fetching user profile:', error);
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
                return;
            } else {
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
                templateMessage = `Hello, my name is ${this.username}. I'll send a Character prompt of a DnD character - create an ongoing "One-Shot" DnD campaign for this character. Please respond.`;
                break;
            case 'template2':
                this.chatService.getCharacterPrompt(this.username).subscribe({
                    next: (response) => {
                        this.message = `Character Prompt: ${response.characterPrompt} `;
                    },
                    error: (error) => {
                        console.error('Error fetching character prompt:', error);
                        this.responses.push({ text: 'Error: Could not fetch character prompt', from: 'bot' });
                    }
                });
                return;
            case 'template3':
                templateMessage = "'I walk in the woods and suddenly I see a monster in the distance, I take a step forward and ... ' continue from that to start a DnD one shot-campaign , based on the character prompt i send you earlier.";
                break;
            case 'template5':
                templateMessage = "'I find myself in the vast desert, the sun blazing overhead and the sand stretching endlessly around me. I take a step forward and ... ' continue from that to start a DnD one shot-campaign , based on the character prompt i send you earlier.";
                break;
            case 'template6':
                templateMessage = "'I enter the bustling city, the sounds of people and traffic filling the air. I navigate through the crowded streets and ... ' continue from that to start a DnD one shot-campaign , based on the character prompt i send you earlier.";
                break;
            case 'template7':
                templateMessage = "'I descend into the dark cave, the air growing colder and the light fading. I light a torch and ... ' continue from that to start a DnD one shot-campaign , based on the character prompt i send you earlier.";
                break;
            case 'template4':
                templateMessage = `Please display last prompt for User ${this.username}, for ${this.username} to know what next prompt to write .`;
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
        this.isCharacterDropupOpen = false;


        if (option.startsWith('character_')) {
            const promptId = option.split('_')[1];
            const selectedPrompt = this.characterPrompts.find(prompt => 
                prompt._id.toString() === promptId
            );

            if (selectedPrompt?.characterPrompt) {
                const cleanPrompt = this.formatCharacterPrompt(selectedPrompt.characterPrompt);
                this.message = cleanPrompt;
            }
        } else {
            this.pasteTemplate();
        }
    }

    private formatCharacterPrompt(promptText: string): string {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = promptText;
            const cleanText = tempDiv.textContent || tempDiv.innerText;

            return cleanText.trim()
                .replace(/\n{3,}/g, '\n\n')
                .replace(/^\s+/gm, '');

        } catch (e) {
            console.error('Error formatting character prompt:', e);
            return promptText;
        }
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

        this.message = this.message.substring(0, start) + formattedText + this.message.substring(end);
        
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
            if (format === 'align') {
                ['align-left', 'align-center', 'align-right'].forEach(f => this.activeFormats.delete(f));
            }
            if (format === 'list') {
                ['list-bullet', 'list-number'].forEach(f => this.activeFormats.delete(f));
            }
            this.activeFormats.add(formatKey);
        }
        
        this.applyFormatting();
    }

    showCharacterPromptHover(): void {
        this.selectedCharacterPrompt = null;
        this.selectedEntry = null;
        this.showStaticHoverCard = true;
        document.body.classList.add('modal-open');
    }

    closeStaticHoverCard(): void {
        this.showStaticHoverCard = false;
        this.selectedEntry = null;
        document.body.classList.remove('modal-open');
    }

    private parsePromptToTableData(promptText: string): CharacterPromptDisplay[] {
        return this.displayFields.map(field => {
            let regex;
            let searchField = field;

            if (field === 'Class Abilities') {
                searchField = '(?:Class (?:Abilities|Features)|Features)';
            }
            
            if (field === 'Equipment' || field === 'Class Abilities' || field === 'Spells') {
                regex = new RegExp(`${searchField}:\\s*([\\s\\S]*?)(?=\\n(?:${this.displayFields.join('|')}):|\$)`, 'i');
            } else {
                regex = new RegExp(`${searchField}:\\s*([^\\n]+(?:\\n(?!\\w+:)[^\\n]+)*)`, 'i');
            }
            
            const match = promptText.match(regex);
            return {
                field: field,
                value: match ? match[1].trim() : '',
                expanded: false
            };
        }).filter(item => item.value !== ''); 
    }


    private applyFormatting(): void {
        const textarea = document.querySelector('.chat-input') as HTMLTextAreaElement;
        if (!textarea) return;


        const tempDiv = document.createElement('div');
        let formattedText = this.message;


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


        tempDiv.innerHTML = formattedText;
        textarea.style.fontWeight = this.activeFormats.has('bold') ? 'bold' : 'normal';
        textarea.style.fontStyle = this.activeFormats.has('italic') ? 'italic' : 'normal';
        textarea.style.textDecoration = this.activeFormats.has('underline') ? 'underline' : 'none';
        textarea.style.textAlign = 
            this.activeFormats.has('align-right') ? 'right' : 
            this.activeFormats.has('align-center') ? 'center' : 
            'left';
    }


    onInputChange(): void {
        this.applyFormatting();
    }


    resetFormatting(): void {
        this.activeFormats.clear();
        this.applyFormatting();
    }

    isSuperUser(): boolean {
        return this.authService.isSuperUser();
    }


    toggleCharacterDropup() {
        this.isCharacterDropupOpen = !this.isCharacterDropupOpen;
        if (this.isCharacterDropupOpen) {
            this.isDropupOpen = false;
        }
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.custom-select')) {
            this.isDropupOpen = false;
            this.isCharacterDropupOpen = false;
        }
    }

    loadCharacterPrompts(): void {
        this.authService.getUsername().subscribe((username: string) => {
            this.chcrcterCreationService.getAllCharacterPrompts(username).subscribe({
                next: (prompts) => {
                    this.characterPrompts = prompts.map((prompt: Character, index: number) => ({
                        ...prompt,
                        index: index + 1,
                        character: prompt.character || { name: '', prompt: '' }
                    }));
                },
                error: (error) => {
                    console.error('Failed to load character prompts:', error);
                    this.toastService.show({
                        template: this.errorTemplate,
                        classname: 'bg-danger text-light',
                        delay: 3000,
                        context: { message: 'Failed to load character prompts' }
                    });
                }
            });
        });
    }

    selectCharacterPrompt(event: Event): void {
        const select = event.target as HTMLSelectElement;
        const selectedIndex = parseInt(select.value);
        
        if (isNaN(selectedIndex) || selectedIndex < 0) {
            this.selectedEntry = null;
            this.selectedCharacterPrompt = null;
            this.selectedCharacterPromptdata = null;
            return;
        }
        
        if (this.characterPrompts[selectedIndex]) {
            const prompt = this.characterPrompts[selectedIndex];
            this.selectedCharacterPrompt = prompt;
            this.selectedCharacterPromptdata = prompt;
            
            if (prompt.characterPrompt) {
                const promptData = this.parsePromptToTableData(prompt.characterPrompt);
                this.selectedEntry = {
                    name: `Character ${prompt.index}`,
                    promptData: promptData
                };
            }
        }
    }

    toggleExpansion(item: CharacterPromptDisplay): void {
        const expandableFields = ['Spells', 'Equipment', 'Class Abilities'];
        if (expandableFields.includes(item.field)) {
            item.expanded = !item.expanded;
        }
    }

    getPreviewText(text: string): string {
        const previewLength = 50;
        return text.length > previewLength 
            ? text.substring(0, previewLength) + '...(click to expand)'
            : text;
    }

    getCharacterName(prompt: Character): string {
        if (!prompt?.characterPrompt) {
            return 'Unnamed Character';
        }
        const nameMatch = prompt.characterPrompt.match(/Character Name:\s*([^\n]+)/i);
        const name = nameMatch ? nameMatch[1].trim() : 'Unnamed Character';
        return name;
    }

    getCharacterLevel(prompt: Character): string {
        if (!prompt?.characterPrompt) return '';
        const levelMatch = prompt.characterPrompt.match(/Level:\s*([^\n]+)/i);
        return levelMatch ? levelMatch[1].trim() : '';
    }

    getCharacterClass(prompt: Character): string {
        if (!prompt?.characterPrompt) return '';
        const classMatch = prompt.characterPrompt.match(/Class:\s*([^\n]+)/i);
        return classMatch ? classMatch[1].trim() : '';
    }

    selectCharacterPromptForChat(prompt: any): void {
        if (prompt && prompt.characterPrompt) {
            const fullName = this.getCharacterName(prompt);
            const firstName = fullName.split(' ')[0];
            
            const formattedPrompt = `Here are the details of ${firstName}:\n\n${prompt.characterPrompt}\n\nBased on the character prompt create a DnD one shot-campaign and improvise to create a prompt. each prompt end in a 3 options to choose to continue the campaign to the next prompt and ${this.username} sending the next prompt as a choice for you to know which new prompt to create.`;
            this.message = formattedPrompt;
            
            this.isCharacterDropupOpen = false;
        }
    }

}
