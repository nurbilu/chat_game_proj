import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ChcrcterCreationService } from '../../services/chcrcter-creation.service';
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
  characters: any[] = [];
  profilePictureUrl: string = 'assets/imgs/profile_pictures/no_profile_pic.png';  // Default placeholder image

  constructor(private authService: AuthService, private characterService: ChcrcterCreationService, private router: Router, private toastService: ToastService) {}

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
    this.authService.getUserProfile().subscribe(
      (data) => {
        this.userProfile = data;
        this.profilePictureUrl = data.profile_picture ? `http://127.0.0.1:8000${data.profile_picture}` : 'assets/imgs/profile_pictures/no_profile_pic.png';
      },
      (error) => {
        this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
      }
    );
  }

  loadUserCharacters(username: string): void {
    this.characterService.fetchCharactersByUsername(username).subscribe(
      (characters) => {
        this.characters = characters;
        console.log('display of characters is successful', username); // Detailed log
      },
      (error) => {
        this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
      }
    );
  }

  deleteCharacter(username: string, characterName: string): void {
    if (!username || !characterName) {
      this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
      return;
    }
    this.characterService.deleteCharacter(username, characterName).subscribe(
      () => {
        this.characters = this.characters.filter(character => character.name !== characterName);
        this.toastService.show({ template: this.successTemplate, classname: 'bg-success text-light', delay: 10000 });
      },
      (error) => {
        this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
      }
    );
  }

  createCharacter(character: any): void {
    if (!character || !character.name || !character.race || !character.gameStyle) {
      this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
      return;
    }
    this.characterService.createCharacter(character).subscribe(
      (response) => {
        this.toastService.show({ template: this.successTemplate, classname: 'bg-success text-light', delay: 10000 });
        this.loadUserCharacters(this.userProfile.username); // Reload characters after creation
      },
      (error) => {
        this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
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
    const username = localStorage.getItem('username'); // Pull username from local storage
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
      this.toastService.show({ template: this.successTemplate, classname: 'bg-success text-light', delay: 10000 });
      this.toastService.show({ template: this.logoutTemplate, classname: 'bg-success text-light', delay: 10000, context: { username } });
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
        this.authService.uploadProfilePicture(file).subscribe(
            response => {
                this.toastService.show({ template: this.successTemplate, classname: 'bg-success text-light', delay: 10000 });
                this.loadUserProfile();  // Reload profile to reflect the new picture
            },
            error => {
                this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
            }
        );
    }
  }
}