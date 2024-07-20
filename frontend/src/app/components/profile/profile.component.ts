import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ChcrcterCreationService } from '../../services/chcrcter-creation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: any = {};  // Initialize to an empty object or suitable defaults
  isSuperuser: boolean = false;
  showUpdateForm: boolean = false;
  showUserData: boolean = true;
  characters: any[] = [];

  constructor(private authService: AuthService, private characterService: ChcrcterCreationService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.authService.decodeToken().then((decodedToken) => {
        this.isSuperuser = decodedToken.isSuperuser;
        if (this.isSuperuser) {
            this.router.navigate(['/super-profile']);
        } else {
            this.loadUserCharacters(decodedToken.username); // Ensure this is called correctly
        }
    }).catch(error => console.error('Error decoding token:', error));
  }

  loadUserProfile(): void {
    this.authService.decodeToken().then((tokenPayload) => {
        this.userProfile = {
            username: tokenPayload.username,
            email: tokenPayload.email,
            address: tokenPayload.address,
            birthdate: new Date(tokenPayload.birthdate)
        };
    }).catch(error => console.error(error));
  }

  loadUserCharacters(username: string): void {
    this.characterService.fetchCharactersByUsername(username).subscribe(
      (characters) => {
        this.characters = characters;
        console.log('Characters loaded:', this.characters); // Detailed log
      },
      (error) => {
        console.error('Failed to load characters:', error);
      }
    );
  }

  deleteCharacter(username: string, characterName: string): void {
    if (!username || !characterName) {
      console.error('Username or Character Name is undefined');
      return;
    }
    this.characterService.deleteCharacter(username, characterName).subscribe(
      () => {
        this.characters = this.characters.filter(character => character.name !== characterName);
        console.log('Character deleted successfully');
      },
      (error) => {
        console.error('Failed to delete character:', error);
      }
    );
  }

  createCharacter(character: any): void {
    if (!character || !character.name || !character.race || !character.gameStyle) {
      console.error('Character object is invalid:', character);
      return;
    }
    this.characterService.createCharacter(character).subscribe(
      (response) => {
        console.log('Character created successfully:', response);
        this.loadUserCharacters(this.userProfile.username); // Reload characters after creation
      },
      (error) => {
        console.error('Failed to create character:', error);
      }
    );
  }

  toggleEditMode(): void {
    this.showUpdateForm = !this.showUpdateForm;
    this.showUserData = false;
  }

  toggleUserDataDisplay(): void {
    this.showUserData = !this.showUserData;
    this.showUpdateForm = false;
  }

  confirmUpdate(): void {
    this.showUpdateForm = false;
    this.showUserData = true;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}