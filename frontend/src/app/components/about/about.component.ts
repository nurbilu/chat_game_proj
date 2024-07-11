import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  // Information about the AI Dungeon Master
  title = 'DeMe - AI Dungeon Master :';
  developer = 'Nur Bilu';
  framework = 'DnD 5e';
}
