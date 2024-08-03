import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private apiUrl = 'http://127.0.0.1:7625/api/fetch_all_collections';

  constructor(private http: HttpClient) { }

  fetchAllCollections(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}