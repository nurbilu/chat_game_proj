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
  pageSize: number = 5;
  maxPages: number = 25;

  constructor(private libraryService: LibraryService, private router: Router) { }

  ngOnInit(): void {
    this.libraryService.fetchAllCollections().subscribe((data: Collection) => {
      this.collections = data;
      this.collectionKeys = Object.keys(data);
      this.sortCollections();
      if (this.collectionKeys.length > 0) {
        this.selectedCollection = this.collectionKeys[0];
      }
    });
  }

  navigateToSection(sectionId: string): void {
    this.router.navigate([], { fragment: sectionId });
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
    this.page = 1; // Reset to first page when changing collection
  }

  sortCollections(): void {
    for (const key of this.collectionKeys) {
      this.collections[key].sort((a, b) => {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (key === 'game styles' && aKeys.includes('style') && bKeys.includes('style')) {
          if (a['style'] < b['style']) return -1;
          if (a['style'] > b['style']) return 1;
        } else if (aKeys.includes('name') && bKeys.includes('name')) {
          if (a['name'] < b['name']) return -1;
          if (a['name'] > b['name']) return 1;
        }
        for (let i = 0; i < aKeys.length; i++) {
          if (a[aKeys[i]] < b[bKeys[i]]) return -1;
          if (a[aKeys[i]] > b[bKeys[i]]) return 1;
        }
        return 0;
      });
    }
  }

  truncateText(text: string, length: number): string {
    if (text.length > length) {
      return text.substring(0, length) + '...';
    }
    return text;
  }

  toggleText(event: any, showFullText: boolean): void {
    const element = event.target.closest('td').querySelector('span');
    const fullText = element.getAttribute('data-full-text');
    const truncatedText = element.getAttribute('data-truncated-text');
    element.innerText = showFullText ? fullText : truncatedText;
  }

  isStringOrNumber(value: any): boolean {
    return typeof value === 'string' || typeof value === 'number';
  }
}