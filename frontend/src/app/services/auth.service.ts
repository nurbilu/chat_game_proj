import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://127.0.0.1:8000/';

    constructor(private http: HttpClient, private jwtHelper: JwtHelperService, @Inject(PLATFORM_ID) private platformId: Object) { }

    // Method to retrieve the token
    getToken(): string | null {
        return localStorage.getItem('token');  // Ensure this matches the key used in localStorage
    }

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

    logout(): Observable<any> {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        return of({ success: true });  // Simulate an observable response
    }

    getUserProfile(username?: string): Observable<any> {
        const token = this.getToken();
        if (!token) {
            console.error('No token found');
            return throwError(() => new Error('Authentication token not found'));
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        let url = `${this.baseUrl}profile/`;
        if (username) {
            url += `${username}/`;
        }
        return this.http.get(url, { headers }).pipe(
            catchError(error => {
                console.error('Failed to fetch user profiles:', error);
                return throwError(() => new Error('Failed to fetch user profiles'));
            })
        );
    }

    getSuperUserProfiles(): Observable<any> {
        const token = this.getToken();
        if (!token) {
            console.error('No token found');
            return throwError(() => new Error('Authentication token not found'));
        }
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get(`${this.baseUrl}superuser/`, { headers }).pipe(
            catchError(error => {
                console.error('Failed to fetch superuser profiles:', error);
                return throwError(() => new Error('Failed to fetch superuser profiles'));
            })
        );
    }

    updateUserProfile(userProfile: any): Observable<any> {
        const token = this.getToken();
        if (!token) {
            console.error('No token found');
            return throwError(() => new Error('Authentication token not found'));
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${this.baseUrl}profile/`, userProfile, { headers });
    }

    decodeToken(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (isPlatformBrowser(this.platformId)) {
                const token = this.getToken();
                if (token) {
                    try {
                        const decoded = this.jwtHelper.decodeToken(token);
                        resolve(decoded);
                    } catch (error) {
                        reject('Error decoding token');
                    }
                } else {
                    reject('Token not found');
                }
            } else {
                reject('Not running in a browser environment');
            }
        });
    }

    changePassword(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}change-password/`, data).pipe(
            catchError(error => throwError(() => new Error('Error changing password: ' + error.message)))
        );
    }
}