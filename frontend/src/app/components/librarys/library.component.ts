import { Component, OnInit } from '@angular/core';
import { LibraryService } from '../../services/library.service';
import { Router } from '@angular/router';

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
  collectionKeys: string[] = [];
  selectedCollection: string = '';
  page: number = 1;
  pageSize: number = 12;
  maxPages: number = 25;
  textVisibility: { [key: number]: boolean } = {};

  constructor(private libraryService: LibraryService, private router: Router) { }

  ngOnInit(): void {
    this.libraryService.fetchAllCollections().subscribe((data: Collection) => {
      this.collections = data;
      this.collectionKeys = Object.keys(data);
      if (this.collectionKeys.length > 0) {
        this.selectedCollection = this.collectionKeys[0];
      }
    });
  }

  toggleTextVisibility(index: number): void {
    this.textVisibility[index] = !this.textVisibility[index];
  }

  getPaginatedItems(): any[] {
    const selectedCollectionItems = this.collections[this.selectedCollection];
    if (!selectedCollectionItems) {
      return [];
    }
    const startIndex = (this.page - 1) * this.pageSize;
    return selectedCollectionItems.slice(startIndex, startIndex + this.pageSize);
  }

  selectCollection(collection: string): void {
    this.selectedCollection = collection;
    this.page = 1;
  }

  isLongText(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const maxCharsPerLine = 30; // Adjust based on your average character count per line
    const maxLines = 5;
    return value.length > maxCharsPerLine * maxLines;
  }

  isString(value: any): boolean {
    return typeof value === 'string';
  }
}