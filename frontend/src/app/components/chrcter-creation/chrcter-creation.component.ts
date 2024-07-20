import { Component, OnInit } from '@angular/core';
import { ChcrcterCreationService } from '../../services/chcrcter-creation.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chrcter-creation',
  templateUrl: './chrcter-creation.component.html',
  styleUrls: ['./chrcter-creation.component.css']
})
export class ChrcterCreationComponent implements OnInit {
  constructor(
    private chcrcterCreationService: ChcrcterCreationService,
    private authService: AuthService,
    private router: Router
  ) { }
  character = {
    name: '', 
    gameStyle: 'none',
    race: '',
    username: ''
  };
  races: any[] = [];
  gameStyles = ['warrior_fighter', 'rogue_druid', 'mage_sorcerer'];

  ngOnInit(): void {
    this.fetchRaces();
    this.authService.decodeToken().then((decodedToken) => {
        if (decodedToken && decodedToken.username) {
            this.character.username = decodedToken.username;
        }
    }).catch(error => console.error(error));
  }

  createCharacter(): void {
    if (this.character.name && this.character.gameStyle !== 'none' && this.character.race && this.character.username) {
      this.chcrcterCreationService.createCharacter(this.character).subscribe({
        next: (response) => {
          console.log('Character created!');
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