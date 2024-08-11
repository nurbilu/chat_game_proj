import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripUrl'
})
export class StripUrlPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): string {
    if (typeof value !== 'string') {
      return value as string; // Cast to string, assuming it's safe to display
    }
    // Remove URLs and then remove {} and []
    return value.replace(/https?:\/\/\S+/g, '').replace(/[\{\}\[\]]/g, '').trim();
  }

}