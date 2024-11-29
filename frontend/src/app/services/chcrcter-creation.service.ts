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
  character: { name: string; prompt: string; };
  _id: string | { $oid: string } | { toString(): string };
  username: string;
  characterPrompt?: string;
  prompt?: any;
  index?: number;
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
        console.error('Failed to fetch character prompts:', error);
        return throwError(() => new Error('Error fetching character prompts: ' + error.message));
      })
    );
  }

  getAllCharacterPrompts(username: string): Observable<Character[]> {
    return this.http.get<Character[]>(`${this.apiUrl}/character_prompts/${username}`).pipe(
      catchError(error => {
        console.error('Failed to fetch all character prompts:', error);
        return throwError(() => new Error('Error fetching character prompts: ' + error.message));
      })
    );
  }

  saveNewCharacterPrompt(character: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/save_character_prompt`, JSON.stringify(character), { headers }).pipe(
      catchError(error => {
        console.error('Failed to save character prompt:', error);
        return throwError(() => new Error('Error saving character prompt: ' + error.message));
      })
    );
  }

  deleteCharacterPrompt(username: string, prompt: Character): Observable<any> {
    // Ensure we have a valid ID
    if (!prompt?._id) {
        return throwError(() => new Error('Invalid prompt: missing _id'));
    }

    // Handle different ObjectId formats
    let promptId: string;
    if (typeof prompt._id === 'object' && '$oid' in prompt._id) {
        promptId = prompt._id.$oid as string;
    } else if (typeof prompt._id === 'object') {
        promptId = prompt._id.toString();
    } else {
        promptId = prompt._id;
    }

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.delete(
        `${this.apiUrl}/character_prompt/${username}/${promptId}`,
        { headers }
    ).pipe(
        catchError(error => {
            console.error('Failed to delete character prompt:', error);
            return throwError(() => new Error('Error deleting character prompt: ' + error.message));
        })
    );
  }

}
