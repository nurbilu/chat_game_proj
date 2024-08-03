import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  isLocalStorageAvailable(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  getItem(key: string): string | null {
    if (this.isLocalStorageAvailable()) {
      return localStorage.getItem(key);
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    }
  }

  clear(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.clear();
    }
  }
}