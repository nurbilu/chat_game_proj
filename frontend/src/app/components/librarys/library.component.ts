import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../../services/library.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CleanTextPipe } from '../../clean-text.pipe';
import { SearchService } from '../../search.service';

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
  collectionKeys: string[] = ['races', 'classes', 'equipment', 'spells', 'monsters'];
  selectedCollection: string = '';
  page: number = 1;
  pageSize: number = 6;
  maxPages: number = 25;
  textVisibility: { [key: number]: boolean } = {};
  displayItems: any[] = [];
  searchQuery: string = '';
  searchResult: any[] = [];
  showSearchResults: boolean = false;

  constructor(private libraryService: LibraryService, private router: Router, private cleanTextPipe: CleanTextPipe, private searchService: SearchService) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.collectionKeys.forEach(collection => {
      this.loadCollectionData(collection);
    });
  }

  loadCollectionData(collection: string): void {
    let fetchObservable: Observable<any>;

    switch (collection) {
      case 'races':
        fetchObservable = this.libraryService.fetchRaces();
        break;
      case 'classes':
        fetchObservable = this.libraryService.fetchClasses();
        break;
      case 'equipment':
        fetchObservable = this.libraryService.fetchEquipment();
        break;
      case 'spells':
        fetchObservable = this.libraryService.fetchSpells();
        break;
      case 'monsters':
        fetchObservable = this.libraryService.fetchMonsters();
        break;
      default:
        return;
    }

    fetchObservable.subscribe((data: any) => {
      if (Array.isArray(data)) {
        this.collections[collection] = data.map(item => {
          if (typeof item === 'object' && item !== null && 'name' in item) {
            return {
              ...item,
              name: this.cleanTextPipe.transform((item as { name: string }).name.toLowerCase())  // Ensure 'name' is lowercase and cleaned
            };
          }
          return item;
        });
      } else if (typeof data === 'object') {
        this.collections[collection] = Object.values(data).flat().map(item => {
          if (typeof item === 'object' && item !== null && 'name' in item) {
            return {
              ...item,
              name: this.cleanTextPipe.transform((item as { name: string }).name.toLowerCase())  // Ensure 'name' is lowercase and cleaned
            };
          }
          return item;
        });
      } else {
        console.error(`Data for collection ${collection} is not an array or object:`, data);
        this.collections[collection] = [];
      }
      if (!this.selectedCollection) {
        this.selectedCollection = collection;
        this.loadPageItems();
      }
    });
  }

  loadPageItems(): void {
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

  isLongText(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const maxCharsPerLine = 30;
    const maxLines = 5;
    return value.length > maxCharsPerLine * maxLines;
  }

  isString(value: any): boolean {
    return typeof value === 'string';
  }

  getKeys(item: { [key: string]: any }): string[] {
    return Object.keys(item).filter(key => key !== '_id' && key !== 'index');
  }

  selectCollection(collection: string): void {
    this.selectedCollection = collection;
    this.showSearchResults = false; // Set to false to show the collection data
    console.log("Selected Collection:", collection);
    if (!this.collections[collection]) {
      console.log("Loading data for collection:", collection);
      this.loadCollectionData(collection);
    } else {
      console.log("Data already loaded for collection:", collection);
      this.loadPageItems();
    }
  }

  toggleTextVisibility(index: number): void {
    this.textVisibility[index] = !this.textVisibility[index];
  }

  isCardCollection(collection: string): boolean {
    return ['classes', 'races'].includes(collection);
  }

  getTextVisibilityIndex(i: number, key: string): number {
    // Ensure unique index for each collapsible element
    return i * 1000 + this.getKeys(this.collections[this.selectedCollection][0]).indexOf(key);
  }

  handleSearchResults(results: { [key: string]: any }): void {
    console.log('Handling search results:', results);
    // Transform the results object into an array
    this.searchResult = Object.values(results).flatMap((category: any) => Object.values(category));
    this.showSearchResults = true;
  }

  clearSearchResults(): void {
    this.searchResult = [];
    this.showSearchResults = false;
  }

  onSearch(): void {
    console.log('LibraryComponent onSearch triggered with query:', this.searchQuery); // Ensure this is logged
    if (this.searchQuery) {
      this.searchService.searchItemByName(this.searchQuery)
        .subscribe({
          next: (results: { [key: string]: any }) => {
            console.log('Received results:', results);
            this.searchResult = Object.values(results).flatMap((category: any) => Object.values(category));
            this.showSearchResults = true;
          },
          error: (error) => {
            console.error('Search error:', error);
            this.searchResult = [];
            this.showSearchResults = false;
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
}