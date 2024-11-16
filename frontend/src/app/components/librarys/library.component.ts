import { Component, OnInit, HostListener } from '@angular/core';
import { LibraryService } from '../../services/library.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CleanTextPipe } from '../../clean-text.pipe';
import { SearchService } from '../../services/search.service';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

interface Collection {
  [key: string]: any[];
}

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit {
  collections: Collection = {};
  collectionKeys: string[] = ['Races', 'Classes', 'Equipment', 'Spells', 'Monsters'];
  selectedCollection: string = '';
  page: number = 1;
  pageSize: number = 6;
  maxPages: number = 40;
  textVisibility: { [key: number]: boolean } = {};
  displayItems: any[] = [];
  searchQuery: string = '';
  searchResult: any[] = [];
  showSearchResults: boolean = false;
  isLoading: boolean = false;
  expandedRows: { [key: number]: boolean } = {};
  isSearchExpanded: boolean = false;
  isCollapsed: boolean = false;
  allRowsExpanded: boolean = false;
  cardExpandedStates: { [key: number]: boolean } = {};
  tableExpandedStates: { [rowIndex: number]: { [key: string]: boolean } } = {};
  showNavigationButtons: boolean = false;
  allCardValuesExpanded: { [cardIndex: number]: boolean } = {};
  showBackToStartButton: boolean = false;
  isModalOpen: boolean = false;
  showHoverCard: boolean = false;
  isScrollbarVisible: boolean = false;
  staticCards: { [key: number]: boolean } = {};

  constructor(private libraryService: LibraryService, private router: Router, private cleanTextPipe: CleanTextPipe, private searchService: SearchService) { }

  ngOnInit(): void {
    this.loadInitialData();
    
    if (typeof window !== 'undefined') {
      this.checkScrollbarVisibility();
      window.addEventListener('scroll', () => this.checkScrollbarVisibility());
    }
    this.checkScrollPosition();
  }

  loadInitialData(): void {
    this.collectionKeys.forEach(collection => {
      this.loadCollectionData(collection);
    });
  }

  loadCollectionData(collection: string): void {
    let fetchObservable: Observable<any>;

    switch (collection) {
      case 'Races':
        fetchObservable = this.libraryService.fetchRaces();
        break;
      case 'Classes':
        fetchObservable = this.libraryService.fetchClasses();
        break;
      case 'Equipment':
        fetchObservable = this.libraryService.fetchEquipment();
        break;
      case 'Spells':
        fetchObservable = this.libraryService.fetchSpells();
        break;
      case 'Monsters':
        fetchObservable = this.libraryService.fetchMonsters();
        break;
      default:
        return;
    }

    fetchObservable.subscribe((data: any) => {
      if (Array.isArray(data)) {
        const allKeys = new Set<string>();
        data.forEach(item => Object.keys(item).forEach(key => allKeys.add(key)));

        this.collections[collection] = data.map((item, index) => {
          const formattedItem = { ...item, rowNumber: index + 1 };
          allKeys.forEach(key => {
            if (!(key in formattedItem)) {
              formattedItem[key] = 'None';
            }
          });
          return formattedItem;
        });
      } else if (typeof data === 'object') {
        // Handle object case if necessary
      } else {
        console.error('Unexpected data format:', data);
      }
      if (!this.selectedCollection) {
        this.selectedCollection = collection;
        this.loadPageItems();
      }
    });
  }

  loadPageItems(): void {
    if (this.isCardCollection(this.selectedCollection)) {
      this.pageSize = 2;
    } else {
      this.pageSize = 20;
    }
    const endIndex = this.page * this.pageSize;
    const startIndex = endIndex - this.pageSize;
    this.displayItems = this.collections[this.selectedCollection]?.slice(startIndex, endIndex) || [];
  }

  getPaginatedItems(): any[] {
    if (!this.selectedCollection || !this.collections[this.selectedCollection]) {
      console.error(`No selected collection or collection data is not loaded for: ${this.selectedCollection}`);
      return [];
    }

    const selectedCollectionItems = this.collections[this.selectedCollection];
    if (!Array.isArray(selectedCollectionItems)) {
      console.error(`Selected collection items for ${this.selectedCollection} is not an array:`, selectedCollectionItems);
      return [];
    }

    const startIndex = (this.page - 1) * this.pageSize;
    return selectedCollectionItems.slice(startIndex, startIndex + this.pageSize);
  }

  isString(value: any): boolean {
    return typeof value === 'string';
  }

  getKeys(item: { [key: string]: any }): string[] {
    return Object.keys(item).filter(key => key !== '_id' && key !== 'index');
  }

  selectCollection(collection: string): void {
    this.selectedCollection = collection;
    this.showSearchResults = false;
    console.log("Selected Collection:", collection);
    if (!this.collections[collection]) {
      console.log("Loading data for collection:", collection);
      this.loadCollectionData(collection);
    } else {
      console.log("Data already loaded for collection:", collection);
      this.loadPageItems();
    }

    this.selectedCollection = collection;
    this.page = 1;
    this.loadPageItems();

    // Add this line to check scrollbar visibility when changing collections
    setTimeout(() => this.checkScrollbarVisibility(), 0);
  }

  isLongText(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const maxChars = 15;
    return value.length > maxChars;
  }

  isCardCollection(collection: string): boolean {
    return ['Classes', 'Races'].includes(collection);
  }

  getTextVisibilityIndex(i: number, key: string): number {
    return i * 1000 + this.getKeys(this.collections[this.selectedCollection][0]).indexOf(key);
  }

  toggleTextVisibility(index: number, key: string): void {
    const visibilityIndex = this.getTextVisibilityIndex(index, key);
    this.textVisibility[visibilityIndex] = !this.textVisibility[visibilityIndex];
    this.updateAllCardValuesExpandedState(index);
  }

  isTextVisible(index: number, key: string): boolean {
    const visibilityIndex = this.getTextVisibilityIndex(index, key);
    return this.textVisibility[visibilityIndex];
  }

  handleSearchResults(results: any[]): void {
    console.log('Handling search results:', results);
    this.searchResult = results;
    this.showSearchResults = true;
  }

  clearSearchResults(): void {
    this.searchResult = [];
    this.showSearchResults = false;
  }

  clearSearchQuery(): void {
    this.searchQuery = '';
  }

  onSearch(): void {
    console.log('LibraryComponent onSearch triggered with query:', this.searchQuery);
    if (this.searchQuery) {
      this.isLoading = true;
      this.searchService.searchItemByName(this.searchQuery)
        .subscribe({
          next: (results: { [key: string]: any }) => {
            this.searchResult = Object.entries(results).map(([key, value]) => ({ key, value }));
            this.showSearchResults = true;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Search error:', error);
            this.searchResult = [];
            this.showSearchResults = false;
            this.isLoading = false;
          }
        });
    } else {
      console.log('Search query is empty');
      this.searchResult = [];
      this.showSearchResults = false;
    }
  }

  formatArray(value: any[]): string {
    if (Array.isArray(value)) {
      return value.map(item => item.name || item).join(', ');
    }
    return String(value);
  }

  toggleRowExpansion(index: number): void {
    this.expandedRows[index] = !this.expandedRows[index];
    this.updateAllRowsExpandedState();
  }

  updateAllRowsExpandedState(): void {
    this.allRowsExpanded = Object.values(this.expandedRows).every(value => value === true);
  }

  toggleSearch(): void {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.classList.toggle('show');
    }
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  toggleAllRows(): void {
    this.allRowsExpanded = !this.allRowsExpanded;
    this.displayItems.forEach((item, index) => {
      this.expandedRows[index] = this.allRowsExpanded;
    });
  }

  // Add a new method to collapse all values in a card
  collapseAllCardValues(): void {
    this.getPaginatedItems().forEach((item, index) => {
      // Reset the card's expanded state
      this.cardExpandedStates[index] = false;
      
      const keys = this.getKeys(item);
      keys.forEach(key => {
        const visibilityIndex = this.getTextVisibilityIndex(index, key);
        this.textVisibility[visibilityIndex] = false;
      });
    });
  }

  // Add a new method to collapse all values in the table
  collapseAllTableValues(): void {
    this.getPaginatedItems().forEach((item, index) => {
      const keys = this.getKeys(item);
      keys.forEach(key => {
        if (key !== 'url' && key !== 'name' && key !== 'rowNumber') {
          const visibilityIndex = this.getTextVisibilityIndex(index, key);
          this.textVisibility[visibilityIndex] = false;
        }
      });
    });
  }

  toggleAllCardValues(cardIndex: number): void {
    this.cardExpandedStates[cardIndex] = !this.cardExpandedStates[cardIndex];
    
    const item = this.getPaginatedItems()[cardIndex];
    const keys = this.getKeys(item);
    
    keys.forEach(key => {
      const visibilityIndex = this.getTextVisibilityIndex(cardIndex, key);
      this.textVisibility[visibilityIndex] = this.cardExpandedStates[cardIndex];
    });
  }

  updateAllCardValuesExpandedState(cardIndex: number): void {
    const keys = this.getKeys(this.getPaginatedItems()[cardIndex]);
    this.allCardValuesExpanded[cardIndex] = keys.every(key => 
      this.isTextVisible(cardIndex, key)
    );
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.checkScrollPosition();
  }

  checkScrollPosition() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showHoverCard = scrollPosition > 300;
  }


  scrollToLeft() {
    const container = document.querySelector('.scrollspy-example');
    if (container) {
      container.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  shouldShowHoverCard(): boolean {
    const allowedCollections = ['Equipment', 'Spells', 'Monsters'];
    const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    return allowedCollections.includes(this.selectedCollection) && (this.isScrollbarVisible || hasHorizontalScroll);
  }

  checkScrollbarVisibility(): void {
    if (typeof window !== 'undefined') {
      const container = document.querySelector('.scrollspy-example');
      if (container) {
        this.isScrollbarVisible = 
          document.documentElement.scrollHeight > document.documentElement.clientHeight ||
          container.scrollWidth > container.clientWidth;
      }
    }
  }

  toggleCardStatic(index: number, event: Event): void {
    event.stopPropagation(); // Prevent event bubbling
    
    if (this.staticCards[index]) {
      // If already static, remove static state
      delete this.staticCards[index];
    } else {
      // If not static, make it static
      this.staticCards[index] = true;
    }
  }
}
