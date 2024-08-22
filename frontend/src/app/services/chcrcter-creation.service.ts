import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

interface Race {
  name: string;
  alignment: string;
  age: string;
  size_description: string;
  language_desc: string;
}

export interface Character {
  _id: string;
  username: string;
  prompt: any;
}

export interface Spell {
  name: string;
  desc: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChcrcterCreationService {
  private apiUrl = 'http://127.0.0.1:6500/api'; // Updated URL to match the new server location

  constructor(private http: HttpClient, private authService: AuthService) { }

  fetchCharactersByUsername(username: string): Observable<Character[]> {
    return this.http.get<Character[]>(`${this.apiUrl}/characters/${username}`).pipe(
      catchError(error => {
        console.error('Failed to fetch characters by username:', error);
        return throwError(() => new Error('Error fetching characters by username: ' + error.message));
      })
    );
  }
  fetchSpellsByClass(className: string): Observable<Spell[]> {
    return this.http.get<Spell[]>(`${this.apiUrl}/spells/${className}`).pipe(
      catchError(error => {
        console.error(`Failed to fetch spells for class ${className}:`, error);
        return throwError(() => new Error('Error fetching spells: ' + error.message));
      })
    );
}

  fetchRaces(): Observable<Race[]> {
    return this.http.get<Race[]>(`${this.apiUrl}/races`).pipe(
      catchError(error => {
        console.error('Failed to fetch races:', error);
        return throwError(() => new Error('Error fetching races: ' + error.message));
      })
    );
}

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

  sendMessageToChatbot(payload: { message: string, username: string }): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/chatbot`, payload, { headers }).pipe(
      catchError(error => {
        console.error('Failed to send message to chatbot:', error);
        return throwError(() => new Error('Error sending message to chatbot: ' + error.message));
      })
    );
  }

  getDraft(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/draft/${username}`).pipe(
      catchError(error => {
        console.error('Failed to get draft:', error);
        return throwError(() => new Error('Error getting draft: ' + error.message));
      })
    );
  }

  saveDraft(draft: { username: string; prompt: string; }): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/save_draft`, JSON.stringify(draft), { headers }).pipe(
      catchError(error => {
        console.error('Failed to save draft:', error);
        return throwError(() => new Error('Error saving draft: ' + error.message));
      })
    );
  }
  saveCharacter(character: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/save_character`, JSON.stringify(character), { headers }).pipe(
      catchError(error => {
        console.error('Failed to save character:', error);
        return throwError(() => new Error('Error saving character: ' + error.message));
      })
    );
  }
  getCharacterPrompt(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/character_prompt/${username}`).pipe(
      catchError(error => {
        console.error('Failed to fetch character prompt:', error);
        return throwError(() => new Error('Error fetching character prompt: ' + error.message));
      })
    );
  }

}
