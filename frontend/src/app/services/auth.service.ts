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
    private baseUrl = 'http://127.0.0.1:8000/'; // Ensure this is correct
    private inMemoryStorage: { [key: string]: string } = {};

    constructor(private http: HttpClient, private jwtHelper: JwtHelperService, @Inject(PLATFORM_ID) private platformId: Object) { }

    // Method to retrieve the token
    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('token') || this.inMemoryStorage['token'] || null;
        }
        return this.inMemoryStorage['token'] || null;  // Return from in-memory storage if not in browser environment
    }

    setItem(key: string, value: string): void {
        if (isPlatformBrowser(this.platformId)) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                this.inMemoryStorage[key] = value;
            }
        } else {
            this.inMemoryStorage[key] = value;
        }
    }

    removeItem(key: string): void {
        if (isPlatformBrowser(this.platformId)) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                delete this.inMemoryStorage[key];
            }
        } else {
            delete this.inMemoryStorage[key];
        }
    }

    register(formData: FormData): Observable<any> {
        return this.http.post(`${this.baseUrl}register/`, formData);
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
                this.setItem('token', response.access);
                this.setItem('username', decodedToken.username);
                this.setItem('profile_picture', decodedToken.profile_picture || 'profile_pictures/no_profile_pic.png');
            }),
            catchError(error => {
                return throwError(() => new Error('Login failed: ' + error.message));
            })
        );
    }

    logout(): Observable<any> {
        this.removeItem('token');
        this.removeItem('username');
        this.removeItem('profile_picture');
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
        });
    }

    changePassword(data: { oldPassword: string; newPassword: string; confirmPassword: string }): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
        });
        const payload = {
            old_password: data.oldPassword,
            new_password: data.newPassword,
            confirm_new_password: data.confirmPassword
        };
        return this.http.put(`${this.baseUrl}change-password/`, payload, { headers }).pipe(
            catchError(error => throwError(() => new Error('Error changing password: ' + error.message)))
        );
    }

    uploadProfilePicture(file: File): Observable<any> {
        const token = this.getToken();
        if (!token) {
            console.error('No token found');
            return throwError(() => new Error('Authentication token not found'));
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const formData = new FormData();
        formData.append('profile_picture', file);
        return this.http.post(`${this.baseUrl}upload-profile-picture/`, formData, { headers }).pipe(
            catchError(error => throwError(() => new Error('Error uploading profile picture: ' + error.message)))
        );
    }
}