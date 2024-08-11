import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cleanText'
})
export class CleanTextPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): string {
    if (typeof value !== 'string') {
      value = String(value); // Ensure the value is treated as a string
    }
    // Updated regex to remove [], {}, and () including nested ones
    return (value as string).replace(/[\{\[\(][^\}\]\)]*[\}\]\)]/g, '').trim();
  }

}