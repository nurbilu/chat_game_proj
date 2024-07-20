import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

interface Race {
  name: string;
  description: string;
  alignment: string;
  size_description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChcrcterCreationService {
  private apiUrl = 'http://127.0.0.1:6500/api'; // Updated URL to match the new server location

  constructor(private http: HttpClient, private authService: AuthService) { }

  createCharacter(character: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/characters`, JSON.stringify(character), { headers }).pipe(
      catchError(error => {
        console.error('Failed to create character:', error);
        return throwError(() => new Error('Error creating character: ' + error.message));
      })
    );
  }
  
  fetchRaces(): Observable<Race[]> {
    const racesUrl = `${this.apiUrl}/races`; // Adjust the URL to where your backend API for races is hosted
    return this.http.get<Race[]>(racesUrl);
  }

  fetchCharactersByUsername(username: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
    return this.http.get<any[]>(`${this.apiUrl}/characters/${username}`, { headers }).pipe(
      catchError(error => {
        console.error('Failed to fetch characters:', error);
        return throwError(() => new Error('Error fetching characters: ' + error.message));
      })
    );
  }

  deleteCharacter(username: string, characterName: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
    return this.http.delete(`${this.apiUrl}/characters/${username}/${characterName}`, { headers }).pipe(
      catchError(error => {
        console.error('Failed to delete character:', error);
        return throwError(() => new Error('Error deleting character: ' + error.message));
      })
    );
  }
}