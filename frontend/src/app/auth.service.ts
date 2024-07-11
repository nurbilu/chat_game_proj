import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://127.0.0.1:8000/';

    constructor(private http: HttpClient, private jwtHelper: JwtHelperService) { }

    register(username: string, password: string, email: string, address: string, birthdate: string): Observable<any> {
        return this.http.post(`${this.baseUrl}register/`, { username, password, email, address, birthdate });
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}login/`, { username, password }).pipe(
            tap(response => {
                if (!response || !response.access) {
                    console.error('Invalid response structure:', response);
                    throw new Error('Token not provided');
                }
                const decodedToken = this.jwtHelper.decodeToken(response.access);
                if (!decodedToken || !decodedToken.username) {
                    console.error('Username not provided in token:', decodedToken);
                    throw new Error('Username not provided in token');
                }
                localStorage.setItem('token', response.access);
                localStorage.setItem('username', decodedToken.username);
            }),
            catchError(error => {
                return throwError(() => new Error('Login failed: ' + error.message));
            })
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    }

    getUserProfile(username?: string): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        let url = `${this.baseUrl}profile/`;
        if (username) {
            url += `${username}/`;
        }
        return this.http.get(url, { headers });
    }

    getUserProfiles(): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get(`${this.baseUrl}profile/`, { headers });
    }

    updateUserProfile(userProfile: any): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${this.baseUrl}profile/`, userProfile, { headers });
    }

    decodeToken(): any {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return null;
        }
        try {
            return this.jwtHelper.decodeToken(token);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    changePassword(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}change-password/`, data).pipe(
            catchError(error => throwError(() => new Error('Error changing password: ' + error.message)))
        );
    }
}
