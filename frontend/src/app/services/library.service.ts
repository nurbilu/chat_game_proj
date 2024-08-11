import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private apiUrl = 'http://127.0.0.1:7625/api';

  constructor(private http: HttpClient) { }

  fetchRaces(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fetch_races`);
  }

  // fetchGameStyles(): Observable<any> {
  //   return this.http.get(`${this.apiUrl}/fetch_game_styles`);
  // }

  fetchEquipment(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fetch_equipment`);
  }


  fetchSpells(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fetch_spells`);
  }
//  no need for classes but maybe yes find a way .
    fetchClasses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/fetch_classes`);
  }
}