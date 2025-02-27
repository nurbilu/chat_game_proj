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

  userProfile: any = {};
  isSuperuser: boolean = false;
  showUpdateForm: boolean = false;
  showUserData: boolean = true;
  characters: Character[] = [];
  profilePictureUrl: string = '';
  selectedCharacter: Character | null = null;
  selectedCharacterIndex: number = -1;
  characterPrompts: Character[] = [];
  characterPrompt: string = '';
  showEditProfile: boolean = false;
  isPromptVisible: boolean = false;
  isPromptLocked: boolean = false;
  promptNumber: number = 1;
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
        this.loadCharacterPrompts(decodedToken.username);
      }
    }).catch(error => console.error('Error decoding token:', error));
  }

  loadUserProfile(): void {
    this.authService.getUserProfile().subscribe(
      (data) => {
        this.userProfile = data;
        this.profilePictureUrl = data.profile_picture ? `http://127.0.0.1:8000${data.profile_picture}` : 'assets/images/default-profile-pic/no_profile_pic.png';
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
    const username = localStorage.getItem('username');
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
    this.loadUserProfile();
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
      const jsonData = JSON.parse(character.characterPrompt);
      return jsonData['Character Name'] || 'Unnamed Character';
    } catch (e) {
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
        const jsonData = JSON.parse(prompt);
        return jsonData[field]?.toString() || '';
    } catch (e) {
        const regex = new RegExp(`${field}:\s*([^\n]+)`, 'i');
        const match = prompt.match(regex);
        return match ? match[1].trim() : '';
    }
  }

  extractEquipment(prompt: string | undefined): { [key: string]: string[] } {
    if (!prompt) return {};
    
    try {
        const equipmentMatch = prompt.match(/Equipment:?([\s\S]*?)(?=\n(?:[A-Z][a-z]+:)|$)/i);
        if (!equipmentMatch) return {};

        const equipmentText = equipmentMatch[1].trim();
        
        const hasCategories = /[A-Z][a-z]+:/.test(equipmentText);
        
        if (hasCategories) {
            const categories: { [key: string]: string[] } = {};
            const categoryMatches = equipmentText.match(/([A-Z][^:]+):([^]*?)(?=(?:\n[A-Z][^:]+:|$))/g);
            
            if (categoryMatches) {
                categoryMatches.forEach(match => {
                    const [category, items] = match.split(':').map(s => s.trim());
                    categories[category] = items
                        .split(/[,\n]/)
                        .map(item => item.trim())
                        .filter(item => item.length > 0);
                });
            }
            return categories;
        } else {
            return {
                'Equipment': equipmentText
                    .split(/[,\n]/)
                    .map(item => item.trim())
                    .filter(item => item.length > 0)
            };
        }
    } catch (e) {
        console.error('Error parsing equipment:', e);
        return {};
    }
  }

  getEquipmentEntries(equipment: any): { key: string; value: string[] }[] {
    if (!equipment) return [];

    const categoryOrder = [
      'Weapons',
      'Armor',
      'Magic Items',
      'Tools',
      'Miscellaneous Gear',
      'Potions',
      'Equipment'
    ];

    const hasOrderedCategories = Object.keys(equipment).some(key => categoryOrder.includes(key));

    if (!hasOrderedCategories) {
      const allItems = Object.values(equipment)
        .flat()
        .filter((item): item is string => typeof item === 'string');
      
      return [{
        key: 'Equipment',
        value: allItems
      }];
    }

    return Object.entries(equipment)
      .sort(([keyA], [keyB]) => {
        const indexA = categoryOrder.indexOf(keyA);
        const indexB = categoryOrder.indexOf(keyB);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      })
      .map(([key, value]) => ({
        key,
        value: Array.isArray(value) 
          ? value.filter((item): item is string => typeof item === 'string')
          : [String(value)]
      }))
      .filter(category => category.value && category.value.length > 0);
  }

  formatEquipment(prompt: string): { category: string; items: string[] }[] {
    const equipment = this.extractEquipment(prompt);
    return this.getEquipmentEntries(equipment)
      .map(({ key, value }) => ({
        category: key,
        items: value
      }));
  }

  resetCharacterSelection(): void {
    this.selectedCharacter = null;
    this.selectedCharacterIndex = -1;
  }

  extractSpells(prompt: string | undefined): { [key: string]: string[] } {
    if (!prompt) return {};
    
    try {
        const spellsMatch = prompt.match(/Spells?:?([\s\S]*?)(?=\n(?:[A-Z][a-z]+:)|$)/i);
        if (!spellsMatch) return {};

        const spellsText = spellsMatch[1].trim();
        const spellsByLevel: { [key: string]: string[] } = {};
        
        const levelSections = spellsText.split(/\n(?=(?:Cantrips|[0-9](?:st|nd|rd|th) Level):)/i);
        
        levelSections.forEach(section => {
            const levelMatch = section.match(/^(Cantrips|[0-9](?:st|nd|rd|th) Level):?([\s\S]*)/i);
            if (levelMatch) {
                const level = levelMatch[1].trim();
                const spells = levelMatch[2]
                    .split(/[,\n]/) 
                    .map(spell => spell.trim())
                    .filter(spell => spell.length > 0 && !spell.match(/^(?:Cantrips|[0-9](?:st|nd|rd|th) Level):?/i));
                
                if (spells.length > 0) {
                    spellsByLevel[level] = spells;
                }
            }
        });
        
        return spellsByLevel;
    } catch (e) {
        console.error('Error parsing spells:', e);
        return {};
    }
  }

  extractClassAbilities(prompt: string | undefined): { [key: string]: string[] } {
    if (!prompt) return {};
    
    try {
        const abilitiesMatch = prompt.match(/(?:Class Features|Class Abilities|Features):?([\s\S]*?)(?=\n(?:[A-Z][a-z]+:)|$)/i);
        if (!abilitiesMatch) return {};

        const abilitiesText = abilitiesMatch[1].trim();
        const abilities: { [key: string]: string[] } = {
            'Class Features': []
        };
        
        const abilityList = abilitiesText
            .split(/(?:\n\s*[•\-\*]|\n\s*\d+\.|\n\n)/)
            .map(ability => ability.trim())
            .filter(ability => ability.length > 0);
            
        abilities['Class Features'] = abilityList;
        
        return abilities;
    } catch (e) {
        console.error('Error parsing class abilities:', e);
        return {};
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
    let spellOrder = [
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
        .filter(([_, value]) => value && value.length > 0)
        .sort(([keyA], [keyB]) => {
            const indexA = spellOrder.indexOf(keyA);
            const indexB = spellOrder.indexOf(keyB);
            return indexA - indexB;
        })
        .map(([key, value]) => ({
            key,
            value: Array.isArray(value) ? value : [value]
        }));
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
      const jsonData = JSON.parse(promptText);
      
      basicFields.forEach(field => {
        result.push({
          field,
          value: jsonData[field] || '',
          isExpandable: false
        });
      });

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
          this.toastService.success('Character prompt copied to clipboard');
        })
        .catch(err => {
          this.toastService.error('Failed to copy character prompt');
        });
    }
  }

  navigateToCharacterCreation(): void {
    this.router.navigate(['/character-creation']);
  }

  navigateToChat(): void {
    this.router.navigate(['/chat']);
  }

  deleteCharacter(character: Character): void {
    this.toastService.success('Character deleted successfully');
  }

  updateProfile(): void {
    this.toastService.success('Profile updated successfully');
  }
}