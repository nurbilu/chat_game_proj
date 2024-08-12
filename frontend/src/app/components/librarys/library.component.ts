import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../../services/library.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

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
  collectionKeys: string[] = ['races', /* 'game_styles', */ 'equipment', 'classes', 'spells', 'monsters'];
  selectedCollection: string = '';
  page: number = 1;
  pageSize: number = 12;
  maxPages: number = 25;
  textVisibility: { [key: number]: boolean } = {};
  displayItems: any[] = [];

  constructor(private libraryService: LibraryService, private router: Router) { }

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
      // case 'game_styles':
      //   fetchObservable = this.libraryService.fetchGameStyles();
      //   break;
      case 'equipment':
        fetchObservable = this.libraryService.fetchEquipment();
        break;
      case 'classes':
        fetchObservable = this.libraryService.fetchClasses();
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
              name: (item as { name: string }).name.toLowerCase()  // Ensure 'name' is lowercase
            };
          }
          return item;
        });
      } else if (typeof data === 'object') {
        this.collections[collection] = Object.values(data).flat().map(item => {
          if (typeof item === 'object' && item !== null && 'name' in item) {
            return {
              ...item,
              name: (item as { name: string }).name.toLowerCase()  // Ensure 'name' is lowercase
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
}