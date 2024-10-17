import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchService } from '../../services/search.service';

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
  noResultsFound: boolean = false;
  isLoading: boolean = false;
  showHoverCard: boolean = false;
  selectedEntry: any = null;

  constructor(private searchService: SearchService) {}

  onSearch(): void {
    console.log('LibSearchComponent onSearch triggered with query:', this.searchQuery);
    if (this.searchQuery) {
      this.isLoading = true;
      this.searchService.searchItemByName(this.searchQuery)
        .subscribe({
          next: (results: { [key: string]: any }) => {
            this.searchResult = Object.entries(results).map(([key, value]) => ({ key, value }));
            this.showSearchResults = true;
            this.noResultsFound = false;
            this.isLoading = false;
            this.searchCompleted.emit(this.searchResult);
          },
          error: (error) => {
            if (error.status === 404) {
              console.error('No results found:', error);
              this.noResultsFound = true;
            } else {
              console.error('Search error:', error);
            }
            this.searchResult = [];
            this.showSearchResults = false;
            this.isLoading = false;
            this.searchCleared.emit();
          }
        });
    } else {
      this.showSearchResults = false;
      this.noResultsFound = false;
      this.isLoading = false;
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
      return item.map(i => i.name || i).join(', ');
    }
    if (typeof item === 'object' && item !== null) {
      return JSON.stringify(item);
    }
    return String(item);
  }

  highlightSubcard(event: MouseEvent) {
    const subcard = (event.target as HTMLElement).closest('.subcard');
    if (subcard) {
      subcard.classList.add('highlighted');
    }
  }

  removeHighlight(event: MouseEvent) {
    const subcard = (event.target as HTMLElement).closest('.subcard');
    if (subcard) {
      subcard.classList.remove('highlighted');
    }
  }

  toggleExpandText(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('adjustable-text')) {
      target.classList.toggle('expanded-text');
    }
  }

  toggleHoverCard(entry: any): void {
    this.selectedEntry = entry;
    this.showHoverCard = true;
  }

  closeHoverCard(): void {
    this.showHoverCard = false;
    this.selectedEntry = null;
  }

}
