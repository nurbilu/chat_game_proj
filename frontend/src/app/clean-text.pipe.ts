import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'cleanText'
})
@Injectable({
  providedIn: 'root'
})
export class CleanTextPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): string {
    if (typeof value === 'string') {
      return value.replace(/[\{\[\(][^\}\]\)]*[\}\]\)]/g, '').trim();
    } else if (Array.isArray(value)) {
      return value.map(item => this.transform(item)).join(', ');
    } else if (typeof value === 'object' && value !== null) {

      return Object.entries(value)
        .map(([key, val]) => {
          if (typeof val === 'object' && val !== null) {
            if (val.hasOwnProperty('name')) {
              return `${key} : name : ${val.name}`;
            } else {
              return `${key} : ${this.transform(val)}`;
            }
          } else {
            return `${key} : ${this.transform(val)}`;
          }
        })
        .join(', ');
    } else {

      return String(value);
    }
  }

}