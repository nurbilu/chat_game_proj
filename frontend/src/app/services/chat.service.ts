import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://127.0.0.1:5000/generate_text';
  private apiUrl1 ='http://127.0.0.1:6500/api';
  private loginUrl = 'http://127.0.0.1:8000/login/';
  private apiUrlRollDice = 'http://127.0.0.1:5000/roll_dice';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(this.loginUrl, { username, password });
  }

  sendMessage(message: string, username?: string): Observable<any> {
    username = username || localStorage.getItem('username')!;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    return this.http.post<any>(this.apiUrl, { prompt: message, username }, { headers }).pipe(
      catchError(error => {
        console.error('HTTP error:', error);
        return throwError(() => new Error('Failed to send message'));
      })
    );
  }

  getCharacterPrompt(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl1}/character_prompt/${username}`).pipe(
      catchError(error => {
        console.error('HTTP error:', error);
        return throwError(() => new Error('Failed to fetch character prompt'));
      })
    );
  }

  rollDice(diceTypes: string[], numDice: number[], modifier: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    const payload = { dice_types: diceTypes, num_dice: numDice, modifier: modifier };
    console.log('Rolling dice with payload:', payload); // Add logging
    return this.http.post<any>(this.apiUrlRollDice, payload, { headers }).pipe(
      catchError(error => {
        console.error('HTTP error:', error);
        return throwError(() => new Error('Failed to roll dice'));
      })
    );
  }
}