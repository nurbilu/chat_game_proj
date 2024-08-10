import { Injectable, NgZone } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrollSpyService {
  constructor(private ngZone: NgZone) {}

  getScrollObservable(): Observable<string> {
    return new Observable<string>((observer) => {
      this.ngZone.runOutsideAngular(() => {
        fromEvent(window, 'scroll')
          .pipe(
            throttleTime(100),
            map(() => this.getCurrentSection())
          )
          .subscribe((section) => {
            this.ngZone.run(() => observer.next(section));
          });
      });
    });
  }

  private getCurrentSection(): string {
    const sections = document.querySelectorAll('section');
    let currentSection = '';
    sections.forEach((section) => {
      if (section instanceof HTMLElement) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom >= 0) {
          currentSection = section.id;
        }
      }
    });
    return currentSection;
  }
}