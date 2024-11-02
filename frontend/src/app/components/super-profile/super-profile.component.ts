import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScrollSpyService } from '../../services/scroll-spy.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { ChcrcterCreationService } from '../../services/chcrcter-creation.service';

interface UserProfile {
  username: string;
  email: string;
  address?: string;
  birthdate?: string;
  password?: string;
  pwd_user_str?: string;
  first_name?: string;
  last_name?: string;
  is_blocked?: boolean;
  characterPrompt?: string;
}

@Component({
  selector: 'app-super-profile',
  templateUrl: './super-profile.component.html',
  styleUrls: ['./super-profile.component.css']
})
export class SuperProfileComponent implements OnInit {
  userProfiles: UserProfile[] = [];
  selectedProfile: UserProfile | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  superUserForm: FormGroup;
  currentSection: string = '';
  searchTerm: string = '';
  filteredProfiles: UserProfile[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private scrollSpyService: ScrollSpyService,
    private modalService: NgbModal,
    private toastService: ToastService,
    private chcrcterCreationService: ChcrcterCreationService
  ) {
    this.superUserForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSuperUserProfiles();
    this.scrollSpyService.getScrollObservable().subscribe((section: string) => {
      this.currentSection = section;
    });
  }

  loadSuperUserProfiles(): void {
    this.isLoading = true;
    this.authService.getSuperUserProfiles().subscribe({
      next: (profiles: UserProfile[]) => {
        this.userProfiles = profiles;
        this.filteredProfiles = profiles;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load superuser profiles:', error);
        this.error = 'Failed to load superuser profiles';
        this.isLoading = false;
      }
    });
  }

  filterProfiles(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = searchTerm;
    this.filteredProfiles = this.userProfiles.filter(profile =>
      profile.username.toLowerCase().includes(searchTerm) ||
      profile.email.toLowerCase().includes(searchTerm)
    );
  }

  onProfileSelect(profile: UserProfile): void {
    this.selectedProfile = profile;
    this.chcrcterCreationService.getCharacterPrompt(profile.username).subscribe({
      next: (response) => {
        this.selectedProfile!.characterPrompt = response.characterPrompt || 'None';
      },
      error: (error) => {
        console.error('Error fetching character prompt:', error);
        this.selectedProfile!.characterPrompt = 'None';
      }
    });
  }

  createSuperUser(): void {
    if (this.superUserForm.valid) {
      this.authService.createSuperUser(this.superUserForm.value).subscribe({
        next: () => {
          this.loadSuperUserProfiles();
          this.superUserForm.reset();
        },
        error: (error) => {
          console.error('Failed to create superuser:', error);
          this.error = 'Failed to create superuser';
        }
      });
    }
  }

  hideTable(): void {
    this.selectedProfile = null;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/homepage']);
      },
      error: (error: any) => console.error('Logout failed:', error)
    });
  }

  blockUser(user: UserProfile): void {
    this.authService.blockUser(user.username).subscribe({
      next: () => {
        if (this.selectedProfile && this.selectedProfile.username === user.username) {
          this.selectedProfile.is_blocked = true;  // Update local state
        }
        user.is_blocked = true;  // Update in the profiles list
        this.toastService.success(`User ${user.username} has been blocked`);
      },
      error: (error) => {
        console.error('Failed to block user:', error);
        this.toastService.error('Failed to block user');
      }
    });
  }

  unblockUser(user: UserProfile): void {
    this.authService.unblockUser(user.username).subscribe({
      next: () => {
        if (this.selectedProfile && this.selectedProfile.username === user.username) {
          this.selectedProfile.is_blocked = false;  // Update local state
        }
        user.is_blocked = false;  // Update in the profiles list
        this.toastService.success(`User ${user.username} has been unblocked`);
      },
      error: (error) => {
        console.error('Failed to unblock user:', error);
        this.toastService.error('Failed to unblock user');
      }
    });
  }

  getUserStatus(user: UserProfile): string {
    return user.is_blocked ? 'Blocked' : 'Active';
  }

  openBlockConfirmationModal(content: any, user: UserProfile): void {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        if (result === 'block') {
          this.blockUser(user);
        }
      },
      (reason) => {
        // Modal dismissed
      }
    );
  }

  openUnblockConfirmationModal(content: any, user: UserProfile): void {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        if (result === 'unblock') {
          this.unblockUser(user);
        }
      },
      (reason) => {
        // Modal dismissed
      }
    );
  }

  deleteUser(user: UserProfile): void {
    this.authService.deleteUser(user.username).subscribe({
      next: (response) => {
        // Remove user from both lists immediately
        this.userProfiles = this.userProfiles.filter(p => p.username !== user.username);
        this.filteredProfiles = this.filteredProfiles.filter(p => p.username !== user.username);
        
        // Clear selected profile if it's the deleted user
        if (this.selectedProfile && this.selectedProfile.username === user.username) {
          this.selectedProfile = null;
        }
        
        // Show success message
        this.toastService.show({
          template: this.toastService.successTemplate,
          classname: 'bg-success text-light',
          delay: 5000,
          context: { message: `User ${user.username} has been permanently deleted` }
        });
        
        // Reset search if the filtered list is empty
        if (this.filteredProfiles.length === 0 && this.searchTerm) {
          this.searchTerm = '';
          this.filteredProfiles = [...this.userProfiles];
        }
      },
      error: (error) => {
        console.error('Failed to delete user:', error);
        this.toastService.show({
          template: this.toastService.errorTemplate,
          classname: 'bg-danger text-light',
          delay: 5000,
          context: { message: 'Failed to delete user. Please try again.' }
        });
      }
    });
  }

  openDeleteConfirmationModal(content: any, user: UserProfile): void {
    this.modalService.open(content, { 
      ariaLabelledBy: 'modal-delete-title',
      backdrop: 'static',
      keyboard: false
    }).result.then(
      (result) => {
        if (result === 'delete') {
          this.deleteUser(user);
        }
      },
      (reason) => {
        // Modal dismissed
      }
    );
  }
}
