import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { ChcrcterCreationService, Character} from '../../services/chcrcter-creation.service';


interface EquipmentCategory {
  key: string;
  value: string[];
}

interface SpellCategory {
  key: string;
  value: string[];
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  @ViewChild('successTemplate', { static: true }) successTemplate!: TemplateRef<any>;
  @ViewChild('errorTemplate', { static: true }) errorTemplate!: TemplateRef<any>;
  @ViewChild('logoutTemplate', { static: true }) logoutTemplate!: TemplateRef<any>;

  userProfile: any = {};  // Initialize to an empty object or suitable defaults
  isSuperuser: boolean = false;
  showUpdateForm: boolean = false;
  showUserData: boolean = true;
  characters: Character[] = []; // Use Character type
  profilePictureUrl: string = '';  // Initialize to an empty string
  selectedCharacter: Character | null = null;
  selectedCharacterIndex: number = -1;
  characterPrompts: Character[] = []; // Change type to Character[]
  characterPrompt: string = ''; // Store the character prompt
  showEditProfile: boolean = false;
  isPromptVisible: boolean = false;
  isPromptLocked: boolean = false;
  promptNumber: number = 1; // Add this property
  showStaticHoverCard: boolean = false;
  expandedFields: { [key: string]: boolean } = {};

  constructor(
    private authService: AuthService,
    private chcrcterCreationService: ChcrcterCreationService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
      if (!isLoggedIn) {
        this.router.navigate(['/login']);
        return;
      }
    });
    this.loadUserProfile();
    this.authService.decodeToken().then((decodedToken) => {
      this.isSuperuser = decodedToken.is_superuser;
      if (this.isSuperuser) {
        this.router.navigate(['/super-profile']);
      } else {
        this.loadCharacterPrompts(decodedToken.username); // Load character prompts
      }
    }).catch(error => console.error('Error decoding token:', error));
  }

  loadUserProfile(): void {
    this.authService.getUserProfile().subscribe(
      (data) => {
        this.userProfile = data;
        this.profilePictureUrl = data.profile_picture ? `http://127.0.0.1:8000${data.profile_picture}` : 'assets/images/default-profile-pic/no_profile_pic.png';  // Use default image if profile picture is not set
      },
      (error) => {
        this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
      }
    );
  }

  loadCharacterPrompts(username: string): void {
    this.chcrcterCreationService.getAllCharacterPrompts(username).subscribe({
      next: (prompts: Character[]) => {
        this.characterPrompts = prompts;
        console.log('Loaded character prompts:', prompts);
      },
      error: (error: Error) => {
        console.error('Failed to load character prompts:', error);
        this.toastService.show({
          template: this.errorTemplate,
          classname: 'bg-danger text-light',
          delay: 3000,
          context: { message: 'Failed to load character prompts' }
        });
      }
    });
  }

  toggleEditMode(): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.showUserData = !this.showUpdateForm;
  }

  cancelEdit(): void {
    this.showUpdateForm = false;
    this.showUserData = true;
  }

  confirmUpdate(): void {
    this.authService.updateUserProfile(this.userProfile).subscribe(
      (data) => {
        this.toastService.show({ template: this.successTemplate, classname: 'bg-success text-light', delay: 10000 });
      },
      (error) => {
        this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
      }
    );
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.userProfile.profile_picture = file;
    }
  }

  logout(): void {
    const username = localStorage.getItem('username'); // Pull username from local storage
    this.toastService.show({ template: this.successTemplate, classname: 'bg-success text-light', delay: 10000 });
    this.toastService.show({ template: this.logoutTemplate, classname: 'bg-success text-light', delay: 10000, context: { username } });
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/homepage']);
    });
  }

  selectCharacter(character: Character, index: number): void {
    this.selectedCharacter = character;
    this.selectedCharacterIndex = index;
    console.log('Selected character:', character);
  }

  onProfileUpdated(): void {
    this.loadUserProfile();  // Reload the profile data
  }

  toggleEditProfile(): void {
    this.showEditProfile = !this.showEditProfile;
  }

  hideEditProfile(): void {
    this.showEditProfile = false;
  }

  showPrompt(): void {
    this.showStaticHoverCard = true;
  }

  hidePrompt(): void {
    this.showStaticHoverCard = false;
  }

  togglePrompt(): void {
    this.isPromptLocked = !this.isPromptLocked;
    this.isPromptVisible = this.isPromptLocked;
  }

  getCharacterName(character: Character | null): string {
    if (!character?.characterPrompt) return '';
    
    try {
      // Try parsing as JSON first
      const jsonData = JSON.parse(character.characterPrompt);
      return jsonData['Character Name'] || 'Unnamed Character';
    } catch (e) {
      // Fallback to text parsing
      const match = character.characterPrompt.match(/Character Name:\s*([^\n]+)/i);
      return match ? match[1].trim() : 'Unnamed Character';
    }
  }

  getCharacterId(character: Character): string {
    if (!character._id) return '';
    return typeof character._id === 'string' ? character._id : character._id.toString();
  }

  extractField(prompt: string | undefined, field: string): string {
    if (!prompt) return '';
    
    try {
        // Try parsing as JSON first
        const jsonData = JSON.parse(prompt);
        return jsonData[field]?.toString() || '';
    } catch (e) {
        // Fallback to text parsing
        const regex = new RegExp(`${field}:\\s*([^\\n]+)`, 'i');
        const match = prompt.match(regex);
        return match ? match[1].trim() : '';
    }
  }

  isEquipmentCategorized(prompt: string | undefined): boolean {
    if (!prompt) return false;
    const equipmentText = this.extractField(prompt, 'equipment');
    if (!equipmentText) return false;
    return !!equipmentText.match(/([A-Z][a-zA-Z]+):/g);
  }

  getEquipmentEntries(equipment: any): EquipmentCategory[] {
    if (!equipment) return [];

    const categoryOrder = [
      'Weapons',
      'Armor',
      'Magic Items',
      'Tools',
      'Miscellaneous Gear',
      'Potions'
    ];

    return Object.entries(equipment)
      .sort(([keyA], [keyB]) => {
        const indexA = categoryOrder.indexOf(keyA);
        const indexB = categoryOrder.indexOf(keyB);
        return indexA - indexB;
      })
      .map(([key, value]) => ({
        key,
        value: Array.isArray(value) ? value : [value]
      }))
      .filter(category => category.value && category.value.length > 0);
  }

  extractEquipment(prompt: string | undefined): { [key: string]: string[] } {
    if (!prompt) return {};
    
    try {
      const jsonData = JSON.parse(prompt);
      if (jsonData.Equipment) {
        return jsonData.Equipment;
      }
    } catch (e) {
      // Fallback to text parsing
      const equipmentSection = this.extractField(prompt, 'Equipment');
      if (!equipmentSection) return {};

      const result: { [key: string]: string[] } = {};
      const categories = ['Weapons', 'Armor', 'Magic Items', 'Tools', 'Miscellaneous Gear', 'Potions'];
      
      categories.forEach(category => {
        const categoryRegex = new RegExp(`${category}:\\s*([^]*?)(?=${categories.join('|')}:|$)`, 'i');
        const match = equipmentSection.match(categoryRegex);
        if (match) {
          result[category] = match[1]
            .split('\n')
            .map(item => item.trim())
            .filter(item => item && item.length > 0);
        }
      });
      
      return result;
    }
    return {};
  }

  isSimpleEquipment(prompt: string | undefined): boolean {
    if (!prompt) return false;
    
    try {
      const jsonData = JSON.parse(prompt);
      return !jsonData.Equipment || typeof jsonData.Equipment === 'string';
    } catch (e) {
      const equipment = this.extractField(prompt, 'Equipment');
      return !equipment.includes(':');
    }
  }

  extractSimpleEquipment(prompt: string | undefined): string[] {
    if (!prompt) return [];
    
    try {
      const jsonData = JSON.parse(prompt);
      if (typeof jsonData.Equipment === 'string') {
        return jsonData.Equipment.split(',').map((item: string) => item.trim());
      }
    } catch (e) {
      const equipment = this.extractField(prompt, 'Equipment');
      if (equipment && !equipment.includes(':')) {
        return equipment
          .split('\n')
          .map(item => item.trim())
          .filter(item => item && item.length > 0);
      }
    }
    return [];
  }

  resetCharacterSelection(): void {
    this.selectedCharacter = null;
    this.selectedCharacterIndex = -1;
  }

  extractSpells(prompt: string | undefined): { [key: string]: string[] } {
    if (!prompt) return {};
    
    try {
      // Try parsing as JSON first
      const jsonData = JSON.parse(prompt);
      if (jsonData.Spells) {
        return jsonData.Spells;
      }
    } catch (e) {
      // Fallback to text parsing
      const spellsSection = this.extractField(prompt, 'Spells');
      if (!spellsSection || spellsSection.toLowerCase() === 'none') {
        return {};
      }

      const result: { [key: string]: string[] } = {};
      const lines = spellsSection.split('\n');
      
      for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        const match = line.match(/^(?:•\s*)?([\w\s]+):\s*([\w\s,]+)$/);
        if (match) {
          const [, level, spellList] = match;
          result[level.trim()] = spellList
            .split(',')
            .map(spell => spell.trim())
            .filter(spell => spell);
        }
      }
      return result;
    }
    return {};
  }

  extractClassAbilities(prompt: string | undefined): { [key: string]: string[] } {
    if (!prompt) return {};
    
    try {
      // Try parsing as JSON first
      const jsonData = JSON.parse(prompt);
      const abilityFields = [
        'Divine Features',
        'Arcane Tradition Features',
        'Invocations',
        'Class Features',
        'Martial Features',
        'Druidic Features',
        'Bardic Features',
        'Monastic Features',
        'Rage Features'
      ];

      const result: { [key: string]: string[] } = {};
      abilityFields.forEach(field => {
        if (jsonData[field] && Array.isArray(jsonData[field])) {
          result[field] = jsonData[field];
        }
      });
      return result;
    } catch (e) {
      // Fallback to text parsing
      return this.extractClassAbilitiesFromText(prompt);
    }
  }

  private extractClassAbilitiesFromText(prompt: string): { [key: string]: string[] } {
    const featureSections = [
      'Divine Features',
      'Arcane Tradition Features',
      'Invocations',
      'Class Features',
      'Martial Features',
      'Druidic Features',
      'Bardic Features',
      'Monastic Features',
      'Rage Features'
    ];

    const result: { [key: string]: string[] } = {};
    
    for (const section of featureSections) {
      const sectionContent = this.extractField(prompt, section);
      if (sectionContent) {
        result[section] = sectionContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.includes(':'));
      }
    }
    return result;
  }

  hasClassAbilities(prompt: string | undefined): boolean {
    if (!prompt) return false;
    const abilities = this.extractClassAbilities(prompt);
    return Object.keys(abilities).length > 0;
  }

  getSpellEntries(spells: { [key: string]: string[] }): SpellCategory[] {
    const spellOrder = [
        'Cantrips',
        '1st Level',
        '2nd Level',
        '3rd Level',
        '4th Level',
        '5th Level',
        '6th Level',
        '7th Level',
        '8th Level',
        '9th Level'
    ];

    return Object.entries(spells)
        .sort(([keyA], [keyB]) => {
            const indexA = spellOrder.indexOf(keyA);
            const indexB = spellOrder.indexOf(keyB);
            return indexA - indexB;
        })
        .map(([key, value]) => ({
            key,
            value: Array.isArray(value) ? value : [value]
        }))
        .filter(category => category.value && category.value.length > 0);
  }

  hasSpells(prompt: string | undefined): boolean {
    if (!prompt) return false;
    
    try {
      const jsonData = JSON.parse(prompt);
      return !!jsonData.Spells && Object.keys(jsonData.Spells).length > 0;
    } catch (e) {
      const spells = this.extractField(prompt, 'Spells');
      if (!spells || spells.toLowerCase() === 'none') return false;
      const extractedSpells = this.extractSpells(prompt);
      return Object.keys(extractedSpells).length > 0;
    }
  }

  formatCharacterPrompt(promptText: string): Array<{field: string, value: string, isExpandable?: boolean}> {
    if (!promptText) return [];
    
    const result = [];
    const basicFields = ['Character Name', 'Race', 'Class', 'Subclass', 'Level'];
    
    try {
      // Try parsing as JSON first
      const jsonData = JSON.parse(promptText);
      
      // Add basic fields
      basicFields.forEach(field => {
        result.push({
          field,
          value: jsonData[field] || '',
          isExpandable: false
        });
      });

      // Add expandable sections
      if (jsonData.Equipment) {
        result.push({
          field: 'Equipment',
          value: JSON.stringify(jsonData.Equipment, null, 2),
          isExpandable: true
        });
      }

      if (jsonData.Spells) {
        result.push({
          field: 'Spells',
          value: JSON.stringify(jsonData.Spells, null, 2),
          isExpandable: true
        });
      }

      if (jsonData.ClassAbilities) {
        result.push({
          field: 'Class Abilities',
          value: JSON.stringify(jsonData.ClassAbilities, null, 2),
          isExpandable: true
        });
      }
    } catch (e) {
      // Fallback to text parsing if JSON parsing fails
      basicFields.forEach(field => {
        const value = this.extractField(promptText, field);
        if (value) {
          result.push({
            field,
            value,
            isExpandable: false
          });
        }
      });

      // Add expandable sections from text
      const equipment = this.extractEquipment(promptText);
      if (Object.keys(equipment).length > 0) {
        result.push({
          field: 'Equipment',
          value: JSON.stringify(equipment, null, 2),
          isExpandable: true
        });
      }

      const spells = this.extractSpells(promptText);
      if (Object.keys(spells).length > 0) {
        result.push({
          field: 'Spells',
          value: JSON.stringify(spells, null, 2),
          isExpandable: true
        });
      }
    }

    return result;
  }

  toggleExpand(field: string): void {
    this.expandedFields[field] = !this.expandedFields[field];
  }

  copyCharacterPrompt(): void {
    if (this.selectedCharacter?.characterPrompt) {
      navigator.clipboard.writeText(this.selectedCharacter.characterPrompt)
        .then(() => {
          this.toastService.show({
            template: this.successTemplate,
            classname: 'bg-success text-light',
            delay: 3000,
            context: { message: 'Character prompt copied to clipboard' }
          });
        })
        .catch(err => {
          this.toastService.show({
            template: this.errorTemplate,
            classname: 'bg-danger text-light',
            delay: 3000,
            context: { message: 'Failed to copy character prompt' }
          });
        });
    }
  }
}