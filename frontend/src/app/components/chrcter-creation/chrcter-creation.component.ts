import { Component, OnInit, TemplateRef, ViewChild, ViewChildren, QueryList, AfterViewInit, ChangeDetectorRef, ElementRef ,EventEmitter, Input, Output, ViewEncapsulation, HostListener} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChcrcterCreationService ,Character} from '../../services/chcrcter-creation.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { NgbAccordionItem } from '@ng-bootstrap/ng-bootstrap';
import { EditorConfig } from 'ngx-simple-text-editor';
import { ChatService } from '../../services/chat.service';
import { SearchService } from '../../services/search.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';


interface ChatbotResponse {
  reply: string;
  characterPrompt?: string; // Add this line to define the characterPrompt property
}

// First, add an interface to define the structure of the prompt data item
interface PromptDataItem {
  field: string;
  value: string;
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
      { name: 'tools', items: ['Maximize'] },
      { name: 'spells', items: ['SpellToggle'] }
    ],
    fontSize_sizes: '1/4px;2/6px;3/8px;4/10px;5/14px;6/20px;7/24px;',
    font_names:
      'Arial/Arial, Helvetica, sans-serif;' +
      'Times New Roman/Times New Roman, Times, serif;' +
      'Verdana/Verdana;' +
      'Open Sans/Open Sans;',
    fontSize_defaultLabel: '5',
    font_defaultLabel: 'Open Sans',
    allowedContent: true,
    extraPlugins: 'divarea',
    removePlugins: 'elementspath'
  };

  @ViewChild('successTemplate', { static: true }) successTemplate!: TemplateRef<any>;
  @ViewChild('errorTemplate', { static: true }) errorTemplate!: TemplateRef<any>;
  @ViewChild('fillFieldsTemplate', { static: true }) fillFieldsTemplate!: TemplateRef<any>;
  @ViewChild('acc', { static: true }) accordion!: NgbAccordionItem;
  characterPromptEditor: any;
  @ViewChildren('spellSelect') spellSelects!: QueryList<ElementRef<HTMLSelectElement>>;
user: any;
  @ViewChild('successToast', { static: true }) successToast!: TemplateRef<any>;
  @ViewChild('errorToast', { static: true }) errorToast!: TemplateRef<any>;

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

  characterPrompts: Character[] = [];
  currentPrompt: Character | null = null;

  isCharacterDisplayCollapsed = false;

  showClassSelection = false;

  templateFiles = {
    cleric: 'assets/deflt-chrcter-prompts/cleric.txt',
    wizard: 'assets/deflt-chrcter-prompts/wizrard.txt',
    rogue: 'assets/deflt-chrcter-prompts/rogue.txt',
    warlock: 'assets/deflt-chrcter-prompts/warlock.txt',
    barbarian: 'assets/deflt-chrcter-prompts/barbarian.txt'
  };

  isLoggedIn$ = this.authService.isLoggedIn();

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
      this.loadCharacterPrompts();
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
    this.authService.isLoggedIn().pipe(
        switchMap((isLoggedIn: boolean) => {
            if (!isLoggedIn) return of(null);
            return this.authService.getUsername();
        }),
        switchMap((username: string | null) => {
            if (!username) return of(null);
            return this.chcrcterCreationService.saveDraft({
                username: username,
                prompt: this.characterPrompt
            });
        })
    ).subscribe({
        next: (response) => {
            if (!response) return;
            this.showToastIfAuthenticated({
                template: this.successToast,
                classname: 'bg-success text-light',
                delay: 3000,
                context: { message: 'Draft saved successfully' }
            });
        },
        error: (error) => {
            console.error('Failed to save draft:', error);
            this.showToastIfAuthenticated({
                template: this.errorToast,
                classname: 'bg-danger text-light',
                delay: 3000,
                context: { message: 'Failed to save draft' }
            });
        }
    });
  }

  loadDraft() {
    // Check if user is logged in before proceeding
    this.authService.isLoggedIn().pipe(
        switchMap((isLoggedIn: boolean) => {
            if (!isLoggedIn) {
                this.characterPrompt = this.getDefaultPromptTemplate();
                return of(null);
            }
            return this.authService.getUsername();
        }),
        switchMap((username: string | null) => {
            if (!username) return of(null);
            return this.chcrcterCreationService.getDraft(username);
        })
    ).subscribe({
        next: (response) => {
            if (!response) return;
            
            if (response.prompt && response.prompt.trim()) {
                this.characterPrompt = response.prompt;
                // Toast will only show if user is logged in
                this.authService.isLoggedIn().subscribe(isLoggedIn => {
                    if (isLoggedIn) {
                        this.toastService.show({
                            template: this.successToast,
                            classname: 'bg-success text-light',
                            delay: 3000,
                            context: { message: 'Draft loaded successfully' }
                        });
                    }
                });
            } else {
                this.characterPrompt = this.getDefaultPromptTemplate();
            }
        },
        error: (error) => {
            console.error('Failed to load draft:', error);
            this.characterPrompt = this.getDefaultPromptTemplate();
            // Only show error toast if user is logged in
            this.authService.isLoggedIn().subscribe(isLoggedIn => {
                if (isLoggedIn) {
                    this.toastService.show({
                        template: this.errorToast,
                        classname: 'bg-danger text-light',
                        delay: 3000,
                        context: { message: 'Failed to load draft' }
                    });
                }
            });
        }
    });
  }

  pasteDraft() {
    this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
      if (!isLoggedIn) {
        this.toastService.show({
          template: this.errorToast,
          classname: 'bg-warning text-dark',
          delay: 3000,
          context: { message: 'Please log in to load drafts' }
        });
        return;
      }

      this.authService.getUsername().subscribe((username: string) => {
        this.chcrcterCreationService.getDraft(username).subscribe({
          next: (response) => {
            if (response.prompt && response.prompt.trim()) {
              this.characterPrompt = response.prompt;
              this.toastService.show({
                template: this.successToast,
                classname: 'bg-success text-light',
                delay: 3000,
                context: { message: 'Draft pasted successfully' }
              });
            } else {
              this.characterPrompt = this.getDefaultPromptTemplate();
              this.toastService.show({
                template: this.errorToast,
                classname: 'bg-warning text-dark',
                delay: 3000,
                context: { message: 'No saved draft found, using default template' }
              });
            }
          },
          error: (error) => {
            console.error('Error loading draft:', error);
            this.characterPrompt = this.getDefaultPromptTemplate();
            this.toastService.show({
              template: this.errorToast,
              classname: 'bg-danger text-light',
              delay: 3000,
              context: { message: 'Failed to load draft' }
            });
          }
        });
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
    this.searchResult = results;
    this.showSearchResults = true;
    if (results.length > 0) {
      this.toastService.success('Results are found indeed!', 'Search Success');
    }
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
        this.toastService.show({
          template: this.successToast,
          classname: 'bg-success text-light',
          delay: 3000,
          context: { message: 'Spell copied to clipboard' }
        });
      }).catch(err => {
        console.error('Failed to copy selected spell: ', err);
        this.toastService.show({
          template: this.errorToast,
          classname: 'bg-danger text-light',
          delay: 3000,
          context: { message: 'Failed to copy spell' }
        });
      });
    } else {
      console.error('Clipboard API not available');
      this.toastService.show({
        template: this.errorToast,
        classname: 'bg-danger text-light',
        delay: 3000,
        context: { message: 'Clipboard API not available' }
      });
    }
  }

  clearEditor(): void {
    this.characterPrompt = '';
  }

  sendMessage() {
    if (!this.characterPrompt.trim()) {
        this.toastService.show({
            template: this.errorToast,
            classname: 'bg-warning text-dark',
            delay: 3000,
            context: { message: 'Please enter a character prompt' }
        });
        return;
    }

    this.authService.getUsername().subscribe((username: string) => {
        const characterData = {
            username: username,
            characterPrompt: this.characterPrompt
        };

        this.chcrcterCreationService.saveNewCharacterPrompt(characterData).subscribe({
            next: () => {
                this.toastService.show({
                    template: this.successToast,
                    classname: 'bg-success text-light',
                    delay: 3000,
                    context: { message: 'Character prompt saved successfully' }
                });
                // Reset the prompt to default template
                this.characterPrompt = this.getDefaultPromptTemplate();
                // Reload the character prompts
                this.loadCharacterPrompts();
            },
            error: (error) => {
                let errorMessage = 'Failed to save character prompt';
                if (error.error?.error === 'Maximum number of characters (4) reached') {
                    errorMessage = 'Maximum number of characters (4) reached';
                }
                this.toastService.show({
                    template: this.errorToast,
                    classname: 'bg-danger text-light',
                    delay: 3000,
                    context: { message: errorMessage }
                });
            }
        });
    });
  }

  onSearch(): void {
    if (!this.searchQuery) {
      this.toastService.warning('Please enter a search term before searching.');
      return;
    }

    if (!/^[a-zA-Z0-9\s-]+$/.test(this.searchQuery)) {
      this.toastService.error('Invalid search format. Please use only letters, numbers, spaces, and hyphens.');
      return;
    }

    this.isSearching = true;
    this.searchService.searchItemByName(this.searchQuery)
      .subscribe({
        next: (results: { [key: string]: any }) => {
          this.searchResult = Object.entries(results).map(([key, value]) => ({ key, value }));
          if (this.searchResult.length === 0) {
            this.toastService.warning('No results found for "' + this.searchQuery + '". Try different keywords.');
            this.showSearchResults = false;
          } else {
            this.showSearchResults = true;
            this.toastService.success('Results are found indeed!', 'Search Success');
          }
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Search error:', error);
          if (error.status === 404) {
            this.toastService.warning(`No results found for "${this.searchQuery}". Please check spelling and try again.`);
          } else {
            this.toastService.error('Search failed. Please try again with different keywords.');
          }
          this.searchResult = [];
          this.showSearchResults = false;
          this.isSearching = false;
        }
      });
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
            template: this.errorToast,
            classname: 'bg-danger text-light',
            delay: 3000,
            context: { message: 'Failed to load character prompt' }
          });
        }
      });
    });
  }

  // Add this method to parse and format spell levels or class abilities
  parseSpellsOrAbilities(promptText: string): { type: string, content: string[] }[] {
    const sections: { type: string, content: string[] }[] = [];
    
    // Check for spells section
    const spellsMatch = promptText.match(/Spells:([^]*?)(?=Equipment:|$)/i);
    if (spellsMatch) {
      const spellContent = spellsMatch[1].trim();
      
      // Parse spell levels
      const spellLevels = spellContent.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (spellLevels.length > 0 && !spellLevels[0].toLowerCase().includes('none')) {
        sections.push({
          type: 'Spells',
          content: spellLevels
        });
      }
    }

    // Check for class abilities/features
    const featureMatches = promptText.match(/(\w+\s*Features?:)([^]*?)(?=Equipment:|Spells:|$)/gi);
    if (featureMatches) {
      featureMatches.forEach(match => {
        const [title, ...content] = match.split('\n');
        const features = content
          .map(line => line.trim())
          .filter(line => line.startsWith('•') || line.length > 0);
        
        if (features.length > 0) {
          sections.push({
            type: title.trim(),
            content: features
          });
        }
      });
    }

    return sections;
  }

  // Update the parsePromptToTableData method
  private parsePromptToTableData(promptText: string): Array<{field: string, value: string, isExpandable?: boolean, expanded?: boolean}> {
    const basicFields = ['character name', 'race', 'class', 'subclass', 'level'];
    const result = [];
    
    // Handle basic fields
    for (const field of basicFields) {
      const regex = new RegExp(`${field}:\\s*([^\\n]+)`, 'i');
      const match = promptText.match(regex);
      result.push({
        field: field.charAt(0).toUpperCase() + field.slice(1),
        value: match ? match[1].trim() : '',
        isExpandable: false
      });
    }

    // Parse spells and abilities
    const sections = this.parseSpellsOrAbilities(promptText);
    sections.forEach(section => {
      result.push({
        field: section.type,
        value: section.content.join('\n'),
        isExpandable: true,
        expanded: false
      });
    });

    // Handle equipment section
    const equipmentMatch = promptText.match(/Equipment:([^]*?)(?=\n\w+:|$)/i);
    if (equipmentMatch) {
      result.push({
        field: 'Equipment',
        value: equipmentMatch[1].trim(),
        isExpandable: true,
        expanded: false
      });
    }
    
    return result;
  }

  copyCharacterPrompt(): void {
    if (this.selectedEntry?.promptData) {
      // Add type annotation for the map callback parameter
      const promptText = this.selectedEntry.promptData
        .map((item: PromptDataItem) => `${item.field}: ${item.value}`)
        .join('\n');

      // Copy to clipboard
      navigator.clipboard.writeText(promptText).then(() => {
        this.toastService.show({
          template: this.successToast,
          classname: 'bg-success text-light',
          delay: 3000,
          context: { message: 'Character prompt copied to clipboard' }
        });
      }).catch(err => {
        console.error('Failed to copy character prompt:', err);
        this.toastService.show({
          template: this.errorToast,
          classname: 'bg-danger text-light',
          delay: 3000,
          context: { message: 'Failed to copy character prompt' }
        });
      });
    }
  }

  loadCharacterPrompts() {
    this.authService.getUsername().subscribe((username: string) => {
        this.chcrcterCreationService.getAllCharacterPrompts(username).subscribe({
            next: (prompts) => {
                this.characterPrompts = prompts.map((prompt: any, index: number) => ({
                    _id: prompt._id.$oid || prompt._id,
                    username: prompt.username,
                    characterPrompt: prompt.characterPrompt,
                    index: index + 1,
                    character: prompt.character || { name: '', prompt: '' }
                }));
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Failed to load character prompts:', error);
                this.characterPrompts = [];
                this.cdr.detectChanges();
            }
        });
    });
  }

  createNewPrompt() {
    if (this.characterPrompts.length >= 4) {
      this.toastService.show({
        template: this.errorToast,
        classname: 'bg-danger text-light',
        delay: 3000,
        context: { message: 'Maximum number of characters (4) reached' }
      });
      return;
    }

    this.showClassSelection = true;
  }

  onClassSelect(selectedClass: string) {
    const nonSpellcasters = ['Barbarian', 'Fighter', 'Monk', 'Rogue'];
    this.characterPrompt = nonSpellcasters.includes(selectedClass) 
      ? this.getNonSpellcasterTemplate() 
      : this.getDefaultPromptTemplate();
    
    this.showClassSelection = false;
    this.currentPrompt = null;
  }

  viewPrompt(prompt: any) {
    this.selectedEntry = {
      name: `Character ${prompt.index}`,
      promptData: this.parsePromptToTableData(prompt.characterPrompt)
    };
    this.showStaticHoverCard = true;
  }

  editPrompt(prompt: Character) {
    this.characterPrompt = prompt.characterPrompt || '';
    this.currentPrompt = prompt;
    
    // Scroll to the editor
    const editorElement = document.querySelector('.text-editor-container');
    if (editorElement) {
      editorElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  deletePrompt(prompt: Character): void {
    if (!prompt?._id) {
        this.toastService.show({
            template: this.errorToast,
            classname: 'bg-danger text-light',
            delay: 3000,
            context: { message: 'Invalid prompt: missing ID' }
        });
        return;
    }

    this.authService.getUsername().subscribe((username: string) => {
        this.chcrcterCreationService.deleteCharacterPrompt(username, prompt).subscribe({
            next: () => {
                // Remove the deleted prompt from the local array
                this.characterPrompts = this.characterPrompts.filter(p => p._id !== prompt._id);
                
                // Show success message
                this.toastService.show({
                    template: this.successToast,
                    classname: 'bg-success text-light',
                    delay: 3000,
                    context: { message: 'Character deleted successfully' }
                });
                
                // Reload the character prompts to ensure sync with server
                this.loadCharacterPrompts();
            },
            error: (error) => {
                console.error('Failed to delete character:', error);
                this.toastService.show({
                    template: this.errorToast,
                    classname: 'bg-danger text-light',
                    delay: 3000,
                    context: { message: 'Failed to delete character' }
                });
            }
        });
    });
  }

  getPromptPreview(prompt: string | undefined): string {
    if (!prompt) return '';
    
    const maxLength = 100;
    return prompt.length > maxLength 
        ? prompt.substring(0, maxLength) + '...'
        : prompt;
  }

  getDefaultPromptTemplate(): string {
    return `
      <div style="text-align: left;"><strong>Character Name:</strong></div>
      <div style="text-align: left;"><strong>Race:</strong></div>
      <div style="text-align: left;"><strong>Class:</strong></div>
      <div style="text-align: left;"><strong>Subclass:</strong></div>
      <div style="text-align: left;"><strong>Level:</strong></div>
      <div style="text-align: left;">
        <strong>Spells:</strong>
        <span class="spell-toggle" contenteditable="false" onclick="event.stopPropagation(); this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">None</span>
        <div class="spell-options" style="display: none;" contenteditable="false">
          <div onclick="
            event.stopPropagation();
            this.parentElement.style.display='none';
            this.parentElement.previousElementSibling.textContent='Available';
            this.parentElement.nextElementSibling.style.display='block'
          ">Yes</div>
          <div onclick="
            event.stopPropagation();
            this.parentElement.style.display='none';
            this.parentElement.previousElementSibling.textContent='None';
            this.parentElement.nextElementSibling.style.display='none'
          ">No</div>
        </div>
        <div class="spell-list">
          <div>Cantrips:</div>
          <div>1st Level:</div>
          <div>2nd Level:</div>
          <div>3rd Level:</div>
          <div>4th Level:</div>
          <div>5th Level:</div>
          <div>6th Level:</div>
          <div>7th Level:</div>
          <div>8th Level:</div>
          <div>9th Level:</div>
        </div>
      </div>
      <div style="text-align: left;"><strong>Equipment:</strong></div>
      <div style="text-align: left;">Weapons</div>
      <div style="text-align: left;">• Armor</div>
      <div style="text-align: left;">• Tools</div>
      <div style="text-align: left;">• Magic Items</div>
      <div style="text-align: left;">• Miscellaneous Gear</div>
      <div style="text-align: left;">• Potions</div>
    `;
  }

  getNonSpellcasterTemplate(): string {
    return `
      <div style="text-align: left;"><strong>Character Name:</strong></div>
      <div style="text-align: left;"><strong>Race:</strong></div>
      <div style="text-align: left;"><strong>Class:</strong></div>
      <div style="text-align: left;"><strong>Subclass:</strong></div>
      <div style="text-align: left;"><strong>Level:</strong></div>
      <div style="text-align: left;"><strong>Class Abilities:</strong></div>
      <div style="text-align: left;"><br></div>
      <div style="text-align: left;"><strong>Equipment:</strong></div>
      <div style="text-align: left;">• Weapons</div>
      <div style="text-align: left;">• Armor</div>
      <div style="text-align: left;">• Tools</div>
      <div style="text-align: left;">• Magic Items</div>
      <div style="text-align: left;">• Miscellaneous Gear</div>
      <div style="text-align: left;">• Potions</div>
    `;
  }

  toggleCharacterDisplay(): void {
    this.isCharacterDisplayCollapsed = !this.isCharacterDisplayCollapsed;
  }

  saveNewCharacter(): void {
    if (this.characterPrompts.length >= 4) {
      this.toastService.show({
        template: this.errorToast,
        classname: 'bg-danger text-light',
        delay: 3000,
        context: { message: 'Maximum number of characters (4) reached' }
      });
      return;
    }

    this.authService.getUsername().subscribe((username: string) => {
      const characterData: Partial<Character> = {
        username: username,
        characterPrompt: this.characterPrompt
      };

      this.chcrcterCreationService.saveNewCharacterPrompt(characterData).subscribe({
        next: () => {
          this.loadCharacterPrompts();
          this.toastService.show({
            template: this.successToast,
            classname: 'bg-success text-light',
            delay: 3000,
            context: { message: 'Character saved successfully' }
          });
        },
        error: (error) => {
          console.error('Failed to save character:', error);
          this.toastService.show({
            template: this.errorToast,
            classname: 'bg-danger text-light',
            delay: 3000,
            context: { message: 'Failed to save character' }
          });
        }
      });
    });
  }

  formatCharacterPrompt(promptText: string): string {
    try {
      // Try to parse as JSON first
      const jsonData = JSON.parse(promptText);
      return this.formatJsonPrompt(jsonData);
    } catch (e) {
      // Fallback to text format if JSON parsing fails
      return this.formatTextPrompt(promptText);
    }
  }

  private formatJsonPrompt(jsonData: any): string {
    let formattedContent = '<div style="text-align: left; padding: 10px;">';

    // Format basic fields
    const basicFields = ['Character Name', 'Race', 'Class', 'Subclass', 'Level'];
    basicFields.forEach(field => {
      if (jsonData[field] !== undefined && jsonData[field] !== null) {
        formattedContent += `
          <div style="margin-bottom: 15px;">
            <strong style="color: #4a90e2;">${field}:</strong>
            <div style="margin-left: 20px; margin-top: 5px;">${jsonData[field]}</div>
          </div>`;
      }
    });

    // Format Spells section
    if (jsonData.Spells) {
      formattedContent += `
        <div style="margin-bottom: 15px;">
          <strong style="color: #4a90e2;">Spells:</strong>
          <div style="margin-left: 20px; margin-top: 5px;">`;
      
      Object.entries(jsonData.Spells).forEach(([level, spells]) => {
        if (Array.isArray(spells)) {
          formattedContent += `
            <div style="margin-bottom: 10px;">
              <strong>${level}:</strong>
              <ul style="margin: 5px 0;">
                ${(spells as string[]).map(spell => `<li>${spell}</li>`).join('')}
              </ul>
            </div>`;
        }
      });
      
      formattedContent += '</div></div>';
    }

    // Format Equipment section
    if (jsonData.Equipment) {
      formattedContent += `
        <div style="margin-bottom: 15px;">
          <strong style="color: #4a90e2;">Equipment:</strong>
          <div style="margin-left: 20px; margin-top: 5px;">`;
      
      Object.entries(jsonData.Equipment).forEach(([category, items]) => {
        if (Array.isArray(items)) {
          formattedContent += `
            <div style="margin-bottom: 10px;">
              <strong>${category}:</strong>
              <ul style="margin: 5px 0;">
                ${(items as string[]).map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>`;
        }
      });
      
      formattedContent += '</div></div>';
    }

    formattedContent += '</div>';
    return formattedContent;
  }

  private formatTextPrompt(promptText: string): string {
    // Keep existing text format logic as fallback
    return `
      <div style="text-align: left; padding: 10px;">
        <div style="margin-bottom: 15px;">
          <strong style="color: #4a90e2;">Character Name:</strong>
          <div style="margin-left: 20px; margin-top: 5px;">${this.extractField(promptText, 'character name') || ''}</div>
        </div>
        // ... rest of existing text format logic ...
      </div>
    `;
  }

  extractField(text: string, fieldName: string): string {
    const regex = new RegExp(`${fieldName}:\\s*([^\\n]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  toggleSpellList(event: Event): void {
    event.stopPropagation(); // Prevent event bubbling
    const target = event.target as HTMLElement;
    const optionsDiv = target.nextElementSibling as HTMLElement;
    
    // Close any other open spell options
    document.querySelectorAll('.spell-options').forEach(el => {
      if (el !== optionsDiv) {
        (el as HTMLElement).style.display = 'none';
      }
    });

    // Toggle this spell options
    if (optionsDiv) {
      optionsDiv.style.display = optionsDiv.style.display === 'none' ? 'block' : 'none';
    }
  }

  selectSpellOption(option: string, event: Event): void {
    event.stopPropagation(); // Prevent event bubbling
    const target = event.target as HTMLElement;
    const optionsDiv = target.parentElement as HTMLElement;
    const spellToggle = optionsDiv.previousElementSibling as HTMLElement;
    const spellList = optionsDiv.nextElementSibling as HTMLElement;

    if (option === 'yes') {
      spellToggle.textContent = 'Available';
      spellList.style.display = 'block';
    } else {
      spellToggle.textContent = 'None';
      spellList.style.display = 'none';
    }
    optionsDiv.style.display = 'none';
  }

  // Add click handler to close spell options when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Don't close if clicking inside the spell options
    if (!(event.target as HTMLElement).closest('.spell-toggle, .spell-options')) {
      document.querySelectorAll('.spell-options').forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    }
  }

  // Add a method to toggle expansion
  toggleExpansion(item: any): void {
    if (item.isExpandable) {
      item.expanded = !item.expanded;
    }
  }

  loadTemplate(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const templateName = select.value;
    
    if (!templateName) return;

    const templatePath = this.templateFiles[templateName as keyof typeof this.templateFiles];
    
    this.http.get(templatePath, { responseType: 'text' }).subscribe({
      next: (content) => {
        try {
          // Try to parse as JSON
          const jsonData = JSON.parse(content);
          this.characterPrompt = this.formatJsonPrompt(jsonData);
        } catch (e) {
          // Fallback to text format if JSON parsing fails
          this.characterPrompt = content
            .replace(/^\*/gm, '•')
            .replace(/^\-/gm, '•')
            .replace(/\*\*(.*?)\*\*/g, '$1');
        }
        
        this.toastService.show({
          template: this.successToast,
          classname: 'bg-success text-light',
          delay: 3000,
          context: { message: 'Template loaded successfully' }
        });
      },
      error: (error) => {
        console.error('Error loading template:', error);
        this.toastService.show({
          template: this.errorToast,
          classname: 'bg-danger text-light',
          delay: 3000,
          context: { message: 'Failed to load template' }
        });
      }
    });
  }

  getPreviewText(text: string): string {
    const previewLength = 100;
    return text.length > previewLength 
      ? text.substring(0, previewLength) + '... (click to expand)'
      : text;
  }

  private showToastIfAuthenticated(toastConfig: any) {
    this.authService.shouldShowDraftToast().subscribe(shouldShow => {
        if (shouldShow) {
            this.toastService.show(toastConfig);
        }
    });
  }
}
