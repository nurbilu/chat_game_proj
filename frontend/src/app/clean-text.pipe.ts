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
      // Updated regex to remove [], {}, and () including nested ones
      return value.replace(/[\{\[\(][^\}\]\)]*[\}\]\)]/g, '').trim();
    } else if (Array.isArray(value)) {
      // If the value is a list, clean each element
      return value.map(item => this.transform(item)).join(', ');
    } else if (typeof value === 'object' && value !== null) {
      // If the value is a dictionary, return key: value pairs
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
      // Ensure the value is treated as a string
      return String(value);
    }
  }

}