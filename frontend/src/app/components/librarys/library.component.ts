import { Component, OnInit, HostListener } from '@angular/core';
import { LibraryService } from '../../services/library.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CleanTextPipe } from '../../clean-text.pipe';
import { SearchService } from '../../services/search.service';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';

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
  showBackToTop: boolean = false;
  showBackToLeft: boolean = false;
  scrollDeltaY: number = 0;
  scrollDeltaX: number = 0;

  constructor(private libraryService: LibraryService, private router: Router, private cleanTextPipe: CleanTextPipe, private searchService: SearchService, private toastService: ToastService) { }

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
    if (!this.searchQuery) {
      this.toastService.warning('Please enter a search term before searching.');
      return;
    }

    if (!/^[a-zA-Z0-9\s-]+$/.test(this.searchQuery)) {
      this.toastService.error('Invalid search format. Please use only letters, numbers, spaces, and hyphens.');
      return;
    }

    this.isLoading = true;
    this.searchService.searchItemByName(this.searchQuery)
      .subscribe({
        next: (results: { [key: string]: any }) => {
          this.searchResult = Object.entries(results).map(([key, value]) => ({ key, value }));
          if (this.searchResult.length === 0) {
            this.toastService.warning('No results found for "' + this.searchQuery + '". Try different keywords.');
            this.showSearchResults = false;
          } else {
            this.showSearchResults = true;
            this.toastService.success('Results are found indeed!', 'Search Success');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Search error:', error);
          if (error.status === 404) {
            this.toastService.warning(`No results found for "${this.searchQuery}". Please check spelling and try again.`);
          } else {
            this.toastService.error('Search failed. Please try again with different keywords.');
          }
          this.searchResult = [];
          this.showSearchResults = false;
          this.isLoading = false;
        }
      });
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

  collapseAllCardValues(): void {
    this.getPaginatedItems().forEach((item, index) => {
      this.cardExpandedStates[index] = false;
      
      const keys = this.getKeys(item);
      keys.forEach(key => {
        const visibilityIndex = this.getTextVisibilityIndex(index, key);
        this.textVisibility[visibilityIndex] = false;
      });
    });
  }

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
    if (typeof window !== 'undefined') {
      this.checkScrollPosition();
    }
  }

  checkScrollPosition() {
    if (typeof window !== 'undefined') {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const container = document.querySelector('.scrollspy-example');
      const horizontalScrollPosition = container ? container.scrollLeft : 0;
      
      this.scrollDeltaY = scrollPosition;
      this.scrollDeltaX = horizontalScrollPosition;
      
      this.showHoverCard = this.scrollDeltaY > 300 || this.scrollDeltaX > 200;
      
      if (this.scrollDeltaX > 200 && this.scrollDeltaY === 0) {
        this.showBackToLeft = true;
        this.showBackToTop = false;
      } else if (this.scrollDeltaY > 300 && this.scrollDeltaX === 0) {
        this.showBackToTop = true;
        this.showBackToLeft = false;
      } else if (this.scrollDeltaX > 200 && this.scrollDeltaY > 300) {
        this.showBackToTop = true;
        this.showBackToLeft = true;
      } else {
        this.showBackToTop = false;
        this.showBackToLeft = false;
      }
    }
  }

  scrollToLeft() {
    if (typeof window !== 'undefined') {
      const container = document.querySelector('.scrollspy-example');
      if (container) {
        container.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      }
    }
  }

  scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  shouldShowHoverCard(): boolean {
    const allowedCollections = ['Equipment', 'Spells', 'Monsters'];
    const container = document.querySelector('.scrollspy-example');
    const horizontalScrollPosition = container ? container.scrollLeft : 0;
    
    return allowedCollections.includes(this.selectedCollection) && horizontalScrollPosition > 200;
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
    event.stopPropagation();
    
    if (this.staticCards[index]) {

      delete this.staticCards[index];
    } else {

      this.staticCards[index] = true;
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.checkScrollPosition();
    }
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    if (typeof window !== 'undefined' && event.target instanceof Element) {
      const container = event.target;
      this.scrollDeltaX = container.scrollLeft;
      this.scrollDeltaY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      this.checkScrollPosition();
    }
  }

  onSearchCompleted(results: any[]): void {
    if (results && results.length > 0) {
      this.searchResult = results;
      this.showSearchResults = true;
      this.toastService.success('Results are found indeed!', 'Search Success');
    } else {
      this.showSearchResults = false;
      this.toastService.warning('Keywords do not match! Please search again - look for spelling mistakes or misstypes.');
    }
  }
}
