import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchService } from '../../search.service';

@Component({
  selector: 'app-lib-search',
  templateUrl: './lib-search.component.html',
  styleUrls: ['./lib-search.component.css']
})
export class LibSearchComponent {
  @Input() searchResult: any[] = [];
  @Output() searchCompleted = new EventEmitter<any[]>();
  @Output() searchCleared = new EventEmitter<void>();

  searchQuery: string = '';
  showSearchResults: boolean = false;

  constructor(private searchService: SearchService) {}

  onSearch(): void {
    console.log('LibSearchComponent onSearch triggered with query:', this.searchQuery);
    if (this.searchQuery) {
      this.searchService.searchItemByName(this.searchQuery)
        .subscribe({
          next: (results: { [key: string]: any }) => {
            console.log('Received results:', results);
            this.searchResult = Object.values(results).flatMap((category: any) => Object.values(category));
            this.showSearchResults = true;
            this.searchCompleted.emit(this.searchResult);
          },
          error: (error) => {
            console.error('Search error:', error);
            this.showSearchResults = false;
            this.searchCleared.emit();
          }
        });
    } else {
      this.showSearchResults = false;
      this.searchCleared.emit();
    }
  }

  formatItem(item: any): string {
    if (Array.isArray(item) && item.length === 0) {
      return 'empty';
    }
    if (typeof item === 'object' && item !== null && Object.keys(item).length === 0) {
      return 'empty';
    }
    if (typeof item === 'string') {
      return item;
    }
    if (Array.isArray(item)) {
      return item.join(', ');
    }
    if (typeof item === 'object' && item !== null) {
      return Object.values(item)
        .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
        .map(value => value.trim())
        .join(', ');
    }
    return String(item);
  }
}