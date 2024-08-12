import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { ChcrcterCreationService } from '../../services/chcrcter-creation.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-chrcter-creation',
  templateUrl: './chrcter-creation.component.html',
  styleUrls: ['./chrcter-creation.component.css']
})
export class ChrcterCreationComponent implements OnInit, AfterViewInit {
  @ViewChild('successTemplate', { static: true }) successTemplate!: TemplateRef<any>;
  @ViewChild('errorTemplate', { static: true }) errorTemplate!: TemplateRef<any>;
  @ViewChild('fillFieldsTemplate', { static: true }) fillFieldsTemplate!: TemplateRef<any>;

  constructor(
    private chcrcterCreationService: ChcrcterCreationService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) { }

  character = {
    name: '', 
    gameStyle: 'none',
    race: '',
    username: ''
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
      this.fetchRaces();
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

  sendMessage(): void {
    if (this.characterPrompt.trim()) {
      this.authService.getUsername().subscribe((username: string) => {
        const payload = {
          message: this.characterPrompt,
          username: username
        };
        this.chcrcterCreationService.sendMessageToChatbot(payload).subscribe({
          next: (response: any) => {
            this.chatMessages.push({ role: 'assistant', content: response.reply });
            this.characterPrompt = '';
          },
          error: (error: any) => {
            this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
          }
        });
      });
    }
  }
  
  sendCharacterPrompt(): void {
    if (this.userMessage.trim()) {
      this.authService.getUsername().subscribe((username: string) => {
        const payload = {
          message: this.userMessage,
          username: username
        };
        this.chatMessages.push({ role: 'user', content: this.userMessage });
        this.chcrcterCreationService.sendMessageToChatbot(payload).subscribe({
          next: (response: any) => {
            this.chatMessages.push({ role: 'assistant', content: response.reply });
            this.userMessage = '';
          },
          error: (error: any) => {
            this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
          }
        });
      });
    }
  }
}