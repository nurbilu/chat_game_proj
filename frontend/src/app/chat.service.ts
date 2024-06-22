import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://127.0.0.1:5000/'; // Flask typically runs on port 5000
  constructor(private http: HttpClient) {}

  sendMessage(prompt: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}chat/`, {params: {prompt}});
  }

  rollDice(diceType: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}roll-dice/`, {params: {type: diceType}});
  }

  startSession(players: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}start-session/`, {players});
  }
}
