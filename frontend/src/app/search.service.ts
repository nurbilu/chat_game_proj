import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  constructor(private http: HttpClient) { }
  apiUrl = 'http://localhost:7625/api';

  searchItemByName(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search/${name}`)
      .pipe(map(response => response));
  }
}