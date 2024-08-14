import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { ChcrcterCreationService } from '../../services/chcrcter-creation.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { NgbAccordionItem } from '@ng-bootstrap/ng-bootstrap';
import { EditorConfig, ToolbarItemType, ExecCommand } from 'ngx-simple-text-editor';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chrcter-creation',
  templateUrl: './chrcter-creation.component.html',
  styleUrls: ['./chrcter-creation.component.css']
})
export class ChrcterCreationComponent implements OnInit {
  public editorConfig: EditorConfig = {
    placeholder: 'Type your prompt here...',
    buttons: [
        { type: ToolbarItemType.Button, command: ExecCommand.bold, icon: '/assets/Icons/Bold.png', title: 'Bold' },
        { type: ToolbarItemType.Button, command: ExecCommand.italic, icon: '/assets/Icons/Italic.png', title: 'Italic' },
        { type: ToolbarItemType.Button, command: ExecCommand.underline, icon: '/assets/Icons/Underline.png', title: 'Underline' },
        { type: ToolbarItemType.Button, command: ExecCommand.strikeThrough, icon: '/assets/Icons/StrikeThrough.png', title: 'Strike Through' },
        { type: ToolbarItemType.Button, command: ExecCommand.fontName, icon: '/assets/Icons/Font.png', title: 'Font Name' },
        { type: ToolbarItemType.Button, command: ExecCommand.fontSize, icon: '/assets/Icons/Font-Size.png', title: 'Font Size' },
        { type: ToolbarItemType.Button, command: ExecCommand.foreColor, icon: '/assets/Icons/Text-Color.png', title: 'Font Color' },
        { type: ToolbarItemType.Button, command: ExecCommand.backColor, icon: '/assets/Icons/BCGroud-Color-swatch.png', title: 'Background Color' },
        { type: ToolbarItemType.Button, command: ExecCommand.createLink, icon: '/assets/Icons/Create-Link.png', title: 'Create Link' },
        { type: ToolbarItemType.Button, command: ExecCommand.insertImage, icon: '/assets/Icons/Insert-Img.png', title: 'Insert Image' },
        { type: ToolbarItemType.Button, command: ExecCommand.removeFormat, icon: '/assets/Icons/Remove-Format.png', title: 'Clear Format' },
        { type: ToolbarItemType.Button, command: ExecCommand.justifyLeft, icon: '/assets/Icons/Justify-Left.png', title: 'Justify Left' },
        { type: ToolbarItemType.Button, command: ExecCommand.justifyCenter, icon: '/assets/Icons/Justify-Full.png', title: 'Justify Center' },
        { type: ToolbarItemType.Button, command: ExecCommand.justifyRight, icon: '/assets/Icons/Justify-Right.png', title: 'Justify Right' },
        { type: ToolbarItemType.Button, command: ExecCommand.justifyFull, icon: '/assets/Icons/Justify-Full.png', title: 'Justify Full' },
        { type: ToolbarItemType.Button, command: ExecCommand.insertOrderedList, icon: '/assets/Icons/Ordered-List.png', title: 'Ordered List' },
        { type: ToolbarItemType.Button, command: ExecCommand.insertUnorderedList, icon: '/assets/Icons/Ordered-List.png', title: 'Unordered List' },
        { type: ToolbarItemType.Button, command: ExecCommand.outdent, icon: '/assets/Icons/Outdent.png', title: 'Outdent' },
        { type: ToolbarItemType.Button, command: ExecCommand.indent, icon: '/assets/Icons/Indent.png', title: 'Indent' },
    ]
  };

  @ViewChild('successTemplate', { static: true }) successTemplate!: TemplateRef<any>;
  @ViewChild('errorTemplate', { static: true }) errorTemplate!: TemplateRef<any>;
  @ViewChild('fillFieldsTemplate', { static: true }) fillFieldsTemplate!: TemplateRef<any>;
  @ViewChild('acc', { static: true }) accordion!: NgbAccordionItem;
  characterPromptEditor: any;
  toolbar: any;

  constructor(
    private chcrcterCreationService: ChcrcterCreationService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private chatService: ChatService
  ) { }

  character = {
    name: '', 
    prompt: ''
  };
  races: any[] = [];
  classes: { name: string, description: string }[] = [
    { name: 'Barbarian', description: 'A fierce warrior of primitive background who can enter a battle rage.' },
    { name: 'Bard', description: 'An inspiring magician whose power echoes the music of creation.' },
    { name: 'Cleric', description: 'A priestly champion who wields divine magic in service of a higher power.' },
    { name: 'Druid', description: 'A priest of the Old Faith, wielding the powers of nature and adopting animal forms.' },
    { name: 'Fighter', description: 'A master of martial combat, skilled with a variety of weapons and armor.' },
    { name: 'Monk', description: 'A master of martial arts, harnessing the power of the body in pursuit of physical and spiritual perfection.' },
    { name: 'Paladin', description: 'A holy warrior bound to a sacred oath.' },
    { name: 'Ranger', description: 'A warrior who uses martial prowess and nature magic to combat threats on the edges of civilization.' },
    { name: 'Rogue', description: 'A scoundrel who uses stealth and trickery to overcome obstacles and enemies.' },
    { name: 'Sorcerer', description: 'A spellcaster who draws on inherent magic from a gift or bloodline.' },
    { name: 'Warlock', description: 'A wielder of magic that is derived from a bargain with an extraplanar entity.' },
    { name: 'Wizard', description: 'A scholarly magic-user capable of manipulating the structures of reality.' }
  ];
  userMessage: string = '';
  characterPrompt: string = '';
  chatMessages: any[] = [];

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
        return;
      }
      this.loadDraft();
      this.fetchRaces();
    });
  }
  saveDraft() {
    this.authService.getUsername().subscribe((username: string) => {
      const draft = {
        username: username,
        prompt: this.characterPrompt
      };
      this.chcrcterCreationService.saveDraft(draft).subscribe({
        next: () => {
          this.toastService.show({ template: this.successTemplate, classname: 'bg-success text-light', delay: 5000 });
        },
        error: (error: any) => {
          this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
        }
      });
    });
  }

  loadDraft() {
    this.authService.getUsername().subscribe((username: string) => {
      this.chcrcterCreationService.getDraft(username).subscribe({
        next: (response) => {
          this.characterPrompt = response.prompt || '';
        },
        error: (error: any) => {
          console.error('Failed to load draft:', error);
        }
      });
    });
  }

  pasteDraft() {
    this.authService.getUsername().subscribe((username: string) => {
      this.chcrcterCreationService.getDraft(username).subscribe({
        next: (response) => {
          this.characterPrompt = response.prompt || '';
        },
        error: (error: any) => {
          console.error('Failed to load draft:', error);
        }
      });
    });
  }



  ngAfterViewInit(): void {
    // No need for manual collapsible logic as we are using ng-bootstrap Accordion
  }

  fetchRaces(): void {
    this.chcrcterCreationService.fetchRaces().subscribe((races: any[]) => {
      this.races = races;
    });
  }

  sendMessage() {
    this.authService.getUsername().subscribe((username: string) => {
      const message = {
        username: username,
        message: this.character.prompt
      };
      this.chcrcterCreationService.sendMessageToChatbot(message).subscribe({
        next: () => {
          this.toastService.show({ template: this.successTemplate, classname: 'bg-success text-light', delay: 5000 });
        },
        error: (error: any) => {
          this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
        }
      });
    });
  }

  clearEditor() {
    this.characterPrompt = '';
  }

  sendChatMessage() {
    this.authService.getUsername().subscribe((username: string) => {
      const message = {
        username: username,
        message: this.userMessage
      };
      this.chatService.sendMessage(this.userMessage, username).subscribe({
        next: (response) => {
          this.chatMessages.push({ role: 'user', content: this.userMessage });
          this.chatMessages.push({ role: 'bot', content: response.response });
          this.userMessage = '';
        },
        error: (error: any) => {
          console.error('Failed to send message:', error);
        }
      });
    });
  }
}