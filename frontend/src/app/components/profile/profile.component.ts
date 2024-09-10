import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Character, ChcrcterCreationService } from '../../services/chcrcter-creation.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

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
  characterPrompts: any[] = []; // Store character prompts
  characterPrompt: string = ''; // Store the character prompt

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
        this.loadCharacterPrompt(decodedToken.username); // Load character prompt
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
    this.characterService.getCharacterPrompt(username).subscribe(
      (prompts) => {
        this.characterPrompts = prompts;
      },
      (error) => {
        console.error('Failed to load character prompts:', error);
      }
    );
  }

  loadCharacterPrompt(username: string): void {
    this.characterService.getCharacterPrompt(username).subscribe(
      (response) => {
        this.characterPrompt = response.characterPrompt;
      },
      (error) => {
        console.error('Failed to load character prompt:', error);
      }
    );
  }

  toggleEditMode(): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.showUserData = !this.showUpdateForm;
  }

  toggleUserDataDisplay(): void {
    this.showUserData = !this.showUserData;
    this.showUpdateForm = false;
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

  selectCharacter(character: Character): void {
    this.selectedCharacter = character;
    // Fetch character details by _id and username
    this.authService.getCharacterByIdAndUsername(character._id, character.username).subscribe(
      (data) => {
        this.selectedCharacter = data;
        // Additional logic if needed
      },
      (error) => {
        this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
      }
    );
  }
}