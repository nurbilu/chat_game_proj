import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://127.0.0.1:5000/generate_text';
  private loginUrl = 'http://127.0.0.1:8000/login/';

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
}