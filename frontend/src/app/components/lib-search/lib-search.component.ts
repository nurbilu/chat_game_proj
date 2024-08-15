import { Component } from '@angular/core';
import { SearchService } from '../../search.service';

@Component({
  selector: 'app-lib-search',
  templateUrl: './lib-search.component.html',
  styleUrls: ['./lib-search.component.css']
})
export class LibSearchComponent {
  searchQuery: string = '';
  searchResult: any = null;
  showSearchResults: boolean = false;


  constructor(private searchService: SearchService) {}

  onSearch(): void {
    if (this.searchQuery) {
      this.searchService.searchItemByName(this.searchQuery)
        .subscribe({
          next: (results) => {
            this.searchResult = results;
            this.showSearchResults = true;
          },
          error: (error) => {
            console.error('Search error:', error);
            this.showSearchResults = false;
          }
        });
    }
  }
}