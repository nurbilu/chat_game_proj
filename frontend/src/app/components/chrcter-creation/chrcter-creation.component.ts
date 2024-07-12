import { Component, OnInit } from '@angular/core';
import { ChcrcterCreationService } from '../../services/chcrcter-creation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chrcter-creation',
  templateUrl: './chrcter-creation.component.html',
  styleUrls: ['./chrcter-creation.component.css']
})
export class ChrcterCreationComponent implements OnInit {
  character = {
    name: '',  // Add the class field
    gameStyle: 'none',
    race: '',
    username: ''
  };
  races: any[] = [];
  gameStyles = ['warrior_fighter', 'rogue_druid', 'mage_sorcerer'];

  constructor(
    private chcrcterCreationService: ChcrcterCreationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.fetchRaces();
    const decodedToken = this.authService.decodeToken();
    if (decodedToken && decodedToken.username) {
      this.character.username = decodedToken.username;
    } else {
      console.error('Username is undefined.');
      // Handle the case where the username is not set, e.g., redirect to login
    }
  }

  createCharacter(): void {
    if (this.character.name && this.character.gameStyle !== 'none' && this.character.race && this.character.username) {
      this.chcrcterCreationService.createCharacter(this.character).subscribe({
        next: (response) => {
          console.log('Character created!', response);
        },
        error: (error) => {
          console.error('Failed to create character:', error);
        }
      });
    } else {
      console.error('Missing required character fields:', this.character);
      // Optionally, display an error message to the user
    }
  }

  fetchRaces(): void {
    this.chcrcterCreationService.fetchRaces().subscribe({
      next: (races) => {
        this.races = races.map(race => ({
          name: race.name,
          description: race.alignment + '. ' + race.size_description
        }));
      },
      error: (error) => {
        console.error('Failed to fetch races:', error);
      }
    });
  }
}