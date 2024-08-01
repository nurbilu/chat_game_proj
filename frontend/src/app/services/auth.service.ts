import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://127.0.0.1:8000/';
    private _isLoggedIn = new BehaviorSubject<boolean>(false);
    private username = new BehaviorSubject<string>('');
    private tokenExpirationTimer: any;
    private jwtHelper = new JwtHelperService();

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object,
        private router: Router,
        private ngZone: NgZone
    ) {
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem('token');
            this._isLoggedIn.next(!!token);
            if (token) {
                const decodedToken = this.jwtHelper.decodeToken(token);
                this.username.next(decodedToken.username);
            }
        }
    }

    // Method to retrieve the token
    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('token') || null;
        }
        return null;  // Return null if not in browser environment
    }

    setItem(key: string, value: string): void {
        if (isPlatformBrowser(this.platformId)) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                // Handle error if localStorage is not available
            }
        }
    }

    removeItem(key: string): void {
        if (isPlatformBrowser(this.platformId)) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                // Handle error if localStorage is not available
            }
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
                this.setItem('username', username);
                this._isLoggedIn.next(true); // Update login state
                this.username.next(decodedToken.username);
                this.startTokenExpirationTimer();
            }),
            catchError(error => {
                return throwError(() => new Error('Login failed: ' + error.message));
            })
        );
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
        const formData = new FormData();
        for (const key in userProfile) {
            if (userProfile.hasOwnProperty(key)) {
                formData.append(key, userProfile[key]);
            }
        }
        return this.http.put(`${this.baseUrl}person/data/update/`, formData, { headers });
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

    isSuperUser(): boolean {
        const token = this.getToken();
        if (!token) {
            return false;
        }
        const decodedToken = this.jwtHelper.decodeToken(token);
        return decodedToken && decodedToken.is_superuser;
    }

    private hasToken(): boolean {
        return isPlatformBrowser(this.platformId) && !!localStorage.getItem('token');
    }

    private startTokenExpirationTimer() {
        const token = this.getToken();
        if (token) {
            const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
            if (expirationDate) {
                const expiresIn = expirationDate.getTime() - Date.now();
                this.tokenExpirationTimer = setTimeout(() => {
                    this.ngZone.run(() => {
                        this.clearLocalStorageAndRefresh();
                    });
                }, expiresIn);
            }
        }
    }

    private clearLocalStorageAndRefresh() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.clear();
        }
        this.router.navigate(['/homepage']).then(() => {
            window.location.reload();
        });
    }

    validateUser(data: { username: string; email: string }): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}validate-user/`, data).pipe(
            catchError(error => throwError(() => new Error('Error validating user: ' + error.message)))
        );
    }

    resetPassword(token: string, data: { newPassword: string; confirmPassword: string }): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        const payload = {
            new_password: data.newPassword,
            confirm_new_password: data.confirmPassword
        };
        return this.http.put(`${this.baseUrl}reset-password/`, payload, { headers }).pipe(
            catchError(error => throwError(() => new Error('Error resetting password: ' + error.message)))
        );
    }

    isLoggedIn(): Observable<boolean> {
        return this._isLoggedIn.asObservable();
    }

    getUsername(): Observable<string> {
        return this.username.asObservable();
    }

    logout(): Observable<void> {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.clear();
            this._isLoggedIn.next(false);
            this.username.next('');
            this.router.navigate(['/homepage']).then(() => {
                window.location.reload();
            });
        }
        return of();
    }

    createSuperUser(data: { username: string; email: string; password: string }): Observable<any> {
        const token = this.getToken();
        if (!token) {
            return throwError(() => new Error('Authentication token not found'));
        }
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        return this.http.post(`${this.baseUrl}create-superuser/`, data, { headers }).pipe(
            catchError(error => throwError(() => new Error('Error creating superuser: ' + error.message)))
        );
    }
}