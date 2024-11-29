import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Character, ChcrcterCreationService } from '../../services/chcrcter-creation.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

// Add this interface at the top of the file
interface EquipmentCategory {
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

  constructor(private authService: AuthService, private characterService: ChcrcterCreationService, private router: Router, private toastService: ToastService) { }

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
    this.characterService.getAllCharacterPrompts(username).subscribe({
      next: (prompts) => {
        this.characterPrompts = prompts;
        console.log('Loaded character prompts:', prompts);
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
    // Fetch character details by _id and username
    this.authService.getCharacterByIdAndUsername(this.getCharacterId(character), character.username).subscribe(
      (data) => {
        this.selectedCharacter = data;
        // Additional logic if needed
      },
      (error) => {
        this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
      }
    );
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
    if (!this.isPromptLocked) {
      this.isPromptVisible = true;
    }
  }

  hidePrompt(): void {
    if (!this.isPromptLocked) {
      this.isPromptVisible = false;
    }
  }

  togglePrompt(): void {
    this.isPromptLocked = !this.isPromptLocked;
    this.isPromptVisible = this.isPromptLocked;
  }

  private getCharacterId(character: Character): string {
    if (!character._id) return '';
    
    // Handle different ObjectId formats
    if (typeof character._id === 'object') {
        // Handle MongoDB ObjectId format with $oid
        if ('$oid' in character._id) {
            return (character._id as any).$oid;
        }
        // Handle other object formats that have toString()
        return character._id.toString();
    }
    // Handle string format
    return character._id;
  }

  extractField(prompt: string | undefined, field: string): string {
    if (!prompt) return '';
    
    const regex = new RegExp(`${field}:\\s*([^\\n]+)`);
    const match = prompt.match(regex);
    return match ? match[1].trim() : '';
  }

  isEquipmentCategorized(prompt: string | undefined): boolean {
    if (!prompt) return false;
    const equipmentText = this.extractField(prompt, 'equipment');
    if (!equipmentText) return false;
    return !!equipmentText.match(/([A-Z][a-zA-Z]+):/g);
  }

  getEquipmentEntries(equipment: { [key: string]: string[] }): EquipmentCategory[] {
    return Object.entries(equipment).map(([key, value]) => ({
        key: key.replace('*', ''), // Remove asterisk if present
        value: value.map(item => item.trim())
    }));
  }

  extractEquipment(prompt: string | undefined): { [key: string]: string[] } {
    if (!prompt) return {};
    
    const equipmentSection = prompt.split('equipment:')[1];
    if (!equipmentSection) return {};

    const result: { [key: string]: string[] } = {};
    let currentCategory = '';
    
    // Split by newlines and process each line
    equipmentSection.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Check if line is a category header (starts with capital letter)
        if (/^[A-Z]/.test(trimmedLine) && !trimmedLine.includes('–') && !trimmedLine.includes('-')) {
            currentCategory = trimmedLine;
            result[currentCategory] = [];
        } else if (currentCategory && trimmedLine) {
            result[currentCategory].push(trimmedLine);
        }
    });

    return result;
  }

  // Add this method to check if equipment is simple or categorized
  isSimpleEquipment(prompt: string | undefined): boolean {
    if (!prompt) return true;
    
    const equipmentSection = prompt.split('equipment:')[1];
    if (!equipmentSection) return true;
    
    // Check if there are any category headers (lines starting with capital letter and no dashes)
    const lines = equipmentSection.split('\n').map(line => line.trim()).filter(line => line);
    return !lines.some(line => /^[A-Z]/.test(line) && !line.includes('–') && !line.includes('-'));
  }

  // Add this method to extract simple equipment
  extractSimpleEquipment(prompt: string | undefined): string[] {
    if (!prompt) return [];
    
    const equipmentSection = prompt.split('equipment:')[1];
    if (!equipmentSection) return [];
    
    return equipmentSection
        .split('\n')
        .map(line => line.trim())
        .filter(line => line);
  }
}