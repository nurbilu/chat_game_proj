import { Component, OnInit, TemplateRef, ViewChild, ViewChildren, QueryList, AfterViewInit, ChangeDetectorRef, ElementRef ,EventEmitter, Input, Output, ViewEncapsulation, HostListener} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChcrcterCreationService } from '../../services/chcrcter-creation.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { NgbAccordionItem } from '@ng-bootstrap/ng-bootstrap';
import { EditorConfig } from 'ngx-simple-text-editor';
import { ChatService } from '../../services/chat.service';
import { SearchService } from '../../services/search.service';


interface ChatbotResponse {
  reply: string;
  characterPrompt?: string; // Add this line to define the characterPrompt property
}

@Component({
  selector: 'app-chrcter-creation',
  templateUrl: './chrcter-creation.component.html',
  styleUrls: ['./chrcter-creation.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ChrcterCreationComponent implements OnInit {
  content = '';
  title = 'ck-text-editor';
  @Input() searchResult: any[] = [];
  @Output() searchCompleted = new EventEmitter<any[]>();
  @Output() searchCleared = new EventEmitter<void>();


  config = {
    toolbar: [
      { name: 'undo', groups: ['undo'], items: ['Undo', 'Redo'] },
      { name: 'basicstyles', groups: ['basicstyles'], items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript'] },
      // { name: 'clipboard', groups: ['clipboard'], items: ['Cut', 'Copy', 'Paste'] },
      { name: 'paragraph', groups: ['align', 'indent', 'list'], items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'Outdent', 'Indent', '-', 'NumberedList', 'BulletedList'] },
      { name: 'styles', groups: ['font', 'colors'], items: ['Font', 'FontSize', '-', 'TextColor', 'BGColor'] },
      { name: 'links', items: ['Link', 'Unlink'] },
      { name: 'forms', items: ['Checkbox', 'Radio'] },
      { name: 'tools', items: ['Maximize'] }
    ],
    fontSize_sizes: '1/4px;2/6px;3/8px;4/10px;5/14px;6/20px;7/24px;',
    font_names:
      'Arial/Arial, Helvetica, sans-serif;' +
      'Times New Roman/Times New Roman, Times, serif;' +
      'Verdana/Verdana;' +
      'Open Sans/Open Sans;',
    fontSize_defaultLabel: '5',
    font_defaultLabel: 'Open Sans',
  };

  @ViewChild('successTemplate', { static: true }) successTemplate!: TemplateRef<any>;
  @ViewChild('errorTemplate', { static: true }) errorTemplate!: TemplateRef<any>;
  @ViewChild('fillFieldsTemplate', { static: true }) fillFieldsTemplate!: TemplateRef<any>;
  @ViewChild('acc', { static: true }) accordion!: NgbAccordionItem;
  characterPromptEditor: any;
  @ViewChildren('spellSelect') spellSelects!: QueryList<ElementRef<HTMLSelectElement>>;
user: any;
  constructor(
    private chcrcterCreationService: ChcrcterCreationService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private searchService: SearchService
  ) { }

  character = {
    name: '', 
    prompt: ''
  };
  races: any[] = [];
  classes: { name: string, description: string, spells: any[], isSpellCaster: boolean }[] = [
    { name: 'Barbarian', description: 'A fierce warrior of primitive background who can enter a battle rage.', spells: [], isSpellCaster: false },
    { name: 'Bard', description: 'An inspiring magician whose power echoes the music of creation.', spells: [], isSpellCaster: true },
    { name: 'Cleric', description: 'A priestly champion who wields divine magic in service of a higher power.', spells: [], isSpellCaster: true },
    { name: 'Druid', description: 'A priest of the Old Faith, wielding the powers of nature and adopting animal forms.', spells: [], isSpellCaster: true },
    { name: 'Fighter', description: 'A master of martial combat, skilled with a variety of weapons and armor.', spells: [], isSpellCaster: false },
    { name: 'Monk', description: 'A master of martial arts, harnessing the power of the body in pursuit of physical and spiritual perfection.', spells: [], isSpellCaster: false },
    { name: 'Paladin', description: 'A holy warrior bound to a sacred oath.', spells: [], isSpellCaster: true },
    { name: 'Ranger', description: 'A warrior who uses martial prowess and nature magic to combat threats on the edges of civilization.', spells: [], isSpellCaster: true },
    { name: 'Rogue', description: 'A scoundrel who uses stealth and trickery to overcome obstacles and enemies.', spells: [], isSpellCaster: false },
    { name: 'Sorcerer', description: 'A spellcaster who draws on inherent magic from a gift or bloodline.', spells: [], isSpellCaster: true },
    { name: 'Warlock', description: 'A wielder of magic that is derived from a bargain with an extraplanar entity.', spells: [], isSpellCaster: true },
    { name: 'Wizard', description: 'A scholarly magic-user capable of manipulating the structures of reality.', spells: [], isSpellCaster: true }
  ];
  filteredClasses: { name: string, description: string, spells: any[], isSpellCaster: boolean }[] = this.classes;
  spellSlotLevels: any;
  levels = Array.from({ length: 20 }, (_, i) => i + 1); // Define levels from 1 to 20

  nonSpellClasses = ['Barbarian', 'Fighter', 'Monk', 'Rogue'];
  spellClasses = this.classes.filter(classItem => !this.nonSpellClasses.includes(classItem.name));
  nonSpellClassList = this.classes.filter(classItem => this.nonSpellClasses.includes(classItem.name));

  spells: any[] = [];

  userMessage: string = '';
  characterPrompt: string = `
  <div style="text-align: left;">character name:&nbsp;</div>
  <div style="text-align: left;"><br></div>
  <div style="text-align: left;">race:&nbsp;<br><br>class:&nbsp;<br><br>subclass:&nbsp;<br><br>level:&nbsp;<br><br>spells:&nbsp;<br></div>
  <div style="text-align: left;"><br></div>
  <div style="text-align: left;">
    <a class="nav-item nav-link active" style="padding: var(--bs-nav-link-padding-y) var(--bs-nav-link-padding-x); font-size: 16px; font-weight: 400; border-color: var(--bs-nav-tabs-link-active-border-color); --bs-link-color-rgb: var(--bs-link-hover-color-rgb); margin-bottom: calc(-1 * var(--bs-nav-tabs-border-width)); border-top-left-radius: var(--bs-nav-tabs-border-radius); border-top-right-radius: var(--bs-nav-tabs-border-radius); isolation: isolate;">
      equipment:&nbsp;
    </a>
  </div>
`;
  chatMessages: any[] = [];
  isLoading: boolean = false;
  progressValue: number = 0;

  searchQuery: string = '';
  showSearchResults: boolean = false;
  noResultsFound: boolean = false;

  selectedSpell: string = '';

  isSearching: boolean = false;

  showBackToTop: boolean = false;

  showStaticHoverCard: boolean = false;
  selectedEntry: any = null;

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
        return;
      }
      this.loadDraft();
      this.fetchRaces();
      this.fetchAllSpells();
      this.loadSpellSlotLevels();
    });

    // Simulate loading process
    this.isLoading = true;
    this.progressValue = 0;
    const interval = setInterval(() => {
      this.progressValue += 10;
      if (this.progressValue >= 100) {
        clearInterval(interval);
        this.isLoading = false;
      }
    }, 500);
  }

  loadSpellSlotLevels(): void {
    this.http.get('/assets/spellSlotLevels.json').subscribe(data => {
      this.spellSlotLevels = data;
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
          if (response.prompt) {
            this.characterPrompt = response.prompt;
          } else {
            this.characterPrompt = `
              <div style="text-align: left;">character name:&nbsp;</div>
              <div style="text-align: left;"><br></div>
              <div style="text-align: left;">race:&nbsp;<br><br>class:&nbsp;<br><br>subclass:&nbsp;<br><br>level:&nbsp;<br><br>spells:&nbsp;<br></div>
              <div style="text-align: left;"><br></div>
              <div style="text-align: left;">
                <a class="nav-item nav-link active" style="padding: var(--bs-nav-link-padding-y) var(--bs-nav-link-padding-x); font-size: 16px; font-weight: 400; border-color: var(--bs-nav-tabs-link-active-border-color); --bs-link-color-rgb: var(--bs-link-hover-color-rgb); margin-bottom: calc(-1 * var(--bs-nav-tabs-border-width)); border-top-left-radius: var(--bs-nav-tabs-border-radius); border-top-right-radius: var(--bs-nav-tabs-border-radius); isolation: isolate;">
                  equipment:&nbsp;
                </a>
              </div>
            `;
          }
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
          if (response.prompt) {
            this.characterPrompt = response.prompt;
          } else {
            this.characterPrompt = `
              <div style="text-align: left;">character name:&nbsp;</div>
              <div style="text-align: left;"><br></div>
              <div style="text-align: left;">race:&nbsp;<br><br>class:&nbsp;<br><br>subclass:&nbsp;<br><br>level:&nbsp;<br><br>spells:&nbsp;<br></div>
              <div style="text-align: left;"><br></div>
              <div style="text-align: left;">
                <a class="nav-item nav-link active" style="padding: var(--bs-nav-link-padding-y) var(--bs-nav-link-padding-x); font-size: 16px; font-weight: 400; border-color: var(--bs-nav-tabs-link-active-border-color); --bs-link-color-rgb: var(--bs-link-hover-color-rgb); margin-bottom: calc(-1 * var(--bs-nav-tabs-border-width)); border-top-left-radius: var(--bs-nav-tabs-border-radius); border-top-right-radius: var(--bs-nav-tabs-border-radius); isolation: isolate;">
                  equipment:&nbsp;
                </a>
              </div>
            `;
          }
        },
        error: (error: any) => {
          console.error('Failed to load draft:', error);
        }
      });
    });
  }

  pasteTemplate(): void {
    this.authService.getUsername().subscribe((username: string) => {
      this.chcrcterCreationService.getCharacterPrompt(username).subscribe({
        next: (response) => {
          this.characterPrompt = `Here are some details for character creation: ${response.characterPrompt}`;
        },
        error: (error: any) => {
          console.error('Failed to fetch character prompt:', error);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    // No need for manual collapsible logic as we are using ng-bootstrap Accordion
  }

  fetchAllSpells(): void {
    this.classes.forEach(classItem => {
        this.chcrcterCreationService.fetchSpellsByClass(classItem.name).subscribe((spells: any[]) => {
          this.isLoading = true;
            classItem.spells = spells.map(spell => spell.name); // Extract only the spell names
            this.cdr.detectChanges(); // Manually trigger change detection
        }, error => {
            console.error(`Error fetching spells for class ${classItem.name}:`, error);
        });
    });
  }
  getSpellSlotLevels(className: string, characterLevel: number): { level: string, slots: string }[] {
    const classLevels = this.spellSlotLevels?.[className];
    const levels = classLevels?.[characterLevel];
    if (!levels) {
      return Array(9).fill({ level: '', slots: '0' });
    }
    if (!this.isSpellCaster(className)) {
      return [];
    }

    const slots = Object.keys(levels).map(level => ({
      level: `Level ${level}`,
      slots: levels[+level].length ? levels[+level].join(', ') : "0"
    }));

    // Ensure unique spell slot levels
    return slots.filter((slot, index, self) =>
      index === self.findIndex((s) => (
        s.level === slot.level && s.slots === slot.slots
      ))
    );
  }

  isSpellCaster(className: string): boolean {
    return !this.nonSpellClasses.includes(className);
  }

  fetchRaces(): void {
    this.chcrcterCreationService.fetchRaces().subscribe((races: any[]) => {
      this.races = races;
      this.cdr.detectChanges(); // Manually trigger change detection
    });
}
  onClassChange(className: string) {
    this.chcrcterCreationService.fetchSpellsByClass(className).subscribe((spells: any[]) => {
        this.spells = spells.map(spell => spell.name); // Extract only the spell names
        console.log('Spells fetched:', this.spells); // Debugging line
        this.cdr.detectChanges(); // Manually trigger change detection
    });
  }



  handleSearchResults(results: any[]): void {
    console.log('Handling search results:', results);
    this.searchResult = results;
    this.showSearchResults = true;
  }

  clearSearchResults(): void {
    this.searchResult = [];
    this.showSearchResults = false;
  }

  onSpellSelectChange(event: Event, className: string): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedSpell = selectElement.value;
    console.log(`Selected spell for ${className}: ${this.selectedSpell}`);
  }

  copySelectedSpell(spell: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(spell).then(() => {
        console.log('Selected spell copied to clipboard', spell);
        this.toastService.show({ template: this.successTemplate, classname: 'bg-success text-light', delay: 3000 });
      }).catch(err => {
        console.error('Failed to copy selected spell: ', err);
      });
    } else {
      console.error('Clipboard API not available');
    }
  }

  clearEditor(): void {
    this.characterPrompt = '';
  }

  sendMessage(): void {
    // Implement the sendMessage logic here
  }

  onSearch(): void {
    console.log('CharacterCreationComponent onSearch triggered with query:', this.searchQuery);
    if (this.searchQuery) {
      this.isSearching = true; // Use isSearching instead of isLoading
      this.searchService.searchItemByName(this.searchQuery)
        .subscribe({
          next: (results: { [key: string]: any }) => {
            this.searchResult = Object.entries(results).map(([key, value]) => ({ key, value }));
            this.showSearchResults = true;
            this.noResultsFound = false;
            this.isSearching = false; // Set isSearching to false when done
            this.searchCompleted.emit(this.searchResult);
          },
          error: (error) => {
            if (error.status === 404) {
              console.error('No results found:', error);
              this.noResultsFound = true;
            } else {
              console.error('Search error:', error);
            }
            this.searchResult = [];
            this.showSearchResults = false;
            this.isSearching = false; // Set isSearching to false on error
            this.searchCleared.emit();
          }
        });
    } else {
      this.showSearchResults = false;
      this.noResultsFound = false;
      this.isSearching = false;
      this.searchCleared.emit();
    }
  }

  formatItem(item: any): string {
    if (Array.isArray(item)) {
      return item.join(', ');
    } else if (typeof item === 'object' && item !== null) {
      return JSON.stringify(item);
    }
    return item.toString();
  }

  clearSearchQuery(): void {
    this.searchQuery = '';
  }

  async pasteText(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      this.searchQuery += text;
      console.log('Text pasted:', text);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) > 300;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleStaticHoverCard(entry: any): void {
    this.selectedEntry = entry;
    this.showStaticHoverCard = true;
    document.body.classList.add('modal-open');
  }

  closeStaticHoverCard(): void {
    this.showStaticHoverCard = false;
    this.selectedEntry = null;
    document.body.classList.remove('modal-open');
  }
}
