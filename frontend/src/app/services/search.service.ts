import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(private http: HttpClient) { }
  apiUrl = 'http://localhost:7625/api';

  searchItemByName(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search/${name}`).pipe(
      map(response => response),
      catchError(error => {
        if (error.status === 404) {
          throw new Error('No results found');
        }
        throw error;
      })
    );
  }
}