import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripUrl'
})
export class StripUrlPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): string {
    if (typeof value !== 'string') {
      return value as string; 
    }
    return value.replace(/https?:\/\/\S+/g, '').replace(/[\{\}\[\]]/g, '').trim();
  }

}