import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ChcrcterCreationService } from '../../services/chcrcter-creation.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-chrcter-creation',
  templateUrl: './chrcter-creation.component.html',
  styleUrls: ['./chrcter-creation.component.css']
})
export class ChrcterCreationComponent implements OnInit {
  @ViewChild('successTemplate', { static: true }) successTemplate!: TemplateRef<any>;
  @ViewChild('errorTemplate', { static: true }) errorTemplate!: TemplateRef<any>;
  @ViewChild('fillFieldsTemplate', { static: true }) fillFieldsTemplate!: TemplateRef<any>;

  constructor(
    private chcrcterCreationService: ChcrcterCreationService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
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
    this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
      if (!isLoggedIn) {
          this.router.navigate(['/login']);
          return;
      }
    });
    this.fetchRaces();
    this.authService.decodeToken().then((decodedToken: any) => {
        if (decodedToken && decodedToken.username) {
            this.character.username = decodedToken.username;
        }
    }).catch((error: any) => console.error(error));
  }

  createCharacter(): void {
    if (this.character.name && this.character.gameStyle !== 'none' && this.character.race && this.character.username) {
      this.chcrcterCreationService.createCharacter(this.character).subscribe({
        next: (response: any) => {
          this.toastService.show({ template: this.successTemplate, classname: 'bg-success text-light', delay: 10000 });
          this.character.name = '';
          this.character.gameStyle = 'none';
          this.character.race = '';
        },
        error: (error: any) => {
          this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
        }
      });
    } else {
      this.toastService.show({ template: this.fillFieldsTemplate, classname: 'bg-danger text-light', delay: 15000 });
    }
  }

  fetchRaces(): void {
    this.chcrcterCreationService.fetchRaces().subscribe({
      next: (races: any) => {
        this.races = races.map((race: any) => ({
          name: race.name,
          description: race.alignment + '. ' + race.size_description
        }));
      },
      error: (error: any) => {
        this.toastService.show({ template: this.errorTemplate, classname: 'bg-danger text-light', delay: 15000 });
      }
    });
  }
}