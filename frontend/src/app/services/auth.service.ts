import { Injectable, Inject, PLATFORM_ID, NgZone, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://127.0.0.1:8000/';
    private _isLoggedIn = new BehaviorSubject<boolean>(false);
    private username = new BehaviorSubject<string>('');
    private tokenExpirationTimer: any;
    private refreshTokenExpirationTimer: any;
    private jwtHelper = new JwtHelperService();
    private httpClient: HttpClient;

    private tokenExpirationSubject = new BehaviorSubject<void>(undefined);
    tokenExpiration$ = this.tokenExpirationSubject.asObservable();

    logoutEvent = new EventEmitter<string>();

    constructor(
        private http: HttpClient,
        private httpBackend: HttpBackend,
        @Inject(PLATFORM_ID) private platformId: Object,
        private router: Router,
        private ngZone: NgZone,
        private toastService: ToastService
    ) {
        this.httpClient = new HttpClient(this.httpBackend);
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refresh_token');
            if (token) {
                this._isLoggedIn.next(true);
                const decodedToken = this.jwtHelper.decodeToken(token);
                this.username.next(decodedToken.username);
                this.startTokenExpirationTimer();
                if (refreshToken) {
                    this.startRefreshTokenExpirationTimer();
                }
            }
        }
    }



    // Method to retrieve the token
    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('token') || null;
        }
        return null;
    }

    setItem(key: string, value: string): void {
        if (isPlatformBrowser(this.platformId)) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                console.error('LocalStorage not available:', e);
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

    private startTokenExpirationTimer() {
        const token = this.getToken();
        if (token) {
            const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
            if (expirationDate) {
                const expiresIn = expirationDate.getTime() - Date.now();
                this.tokenExpirationTimer = setTimeout(() => {
                    this.tokenExpirationSubject.next();
                    this.refreshToken().subscribe({
                        next: () => {
                        },
                        error: () => {
                            this.clearLocalStorage();
                            this.toastService.show({
                                template: this.toastService.errorTemplate,
                                classname: 'bg-danger text-light',
                                delay: 15000,
                                context: { message: 'Your session has expired. Please log in again.' }
                            });
                            this.router.navigate(['/homepage']);
                        }
                    });
                }, expiresIn);
            }
        }
    }

    private startRefreshTokenExpirationTimer() {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
            const decodedToken = this.jwtHelper.decodeToken(refreshToken);
            const expirationDate = new Date(decodedToken.exp * 1000); // Convert to milliseconds
            const expiresIn = expirationDate.getTime() - Date.now();
            this.refreshTokenExpirationTimer = setTimeout(() => {
                this.clearLocalStorage();
                this.toastService.show({
                    template: this.toastService.errorTemplate,
                    classname: 'bg-danger text-light',
                    delay: 15000,
                    context: { message: 'Your session has expired. Please log in again.' }
                });
                this.router.navigate(['/homepage']);
            }, expiresIn);
        }
    }


    register(formData: FormData): Observable<any> {
        return this.http.post(`${this.baseUrl}register/`, formData).pipe(
            catchError(error => throwError(() => new Error('Error registering user: ' + error.message)))
        );
    }

    login(username: string, password: string, rememberMe: boolean): Observable<any> {
        return this.httpClient.post<any>(`${this.baseUrl}login/`, { username, password, remember_me: rememberMe }).pipe(
            tap(response => {
                if (!response || !response.access) {
                    throw new Error('Token not provided');
                }
                const decodedToken = this.jwtHelper.decodeToken(response.access);
                if (!decodedToken || !decodedToken.username) {
                    throw new Error('Username not provided in token');
                }
                this.setItem('token', response.access);
                if (rememberMe) {
                    this.setItem('refresh_token', response.refresh);
                    this.startRefreshTokenExpirationTimer();
                }
                this.setItem('username', username);
                this._isLoggedIn.next(true);
                this.username.next(decodedToken.username);
                this.startTokenExpirationTimer();

                // Get saved nav link from session storage
                const savedNavLink = sessionStorage.getItem('lastNavLink');
                const targetRoute = savedNavLink && this.requiresAuth(savedNavLink) 
                    ? savedNavLink 
                    : this.isSuperUser() ? '/super-profile' : '/chat';
                
                // Clear the saved nav link
                sessionStorage.removeItem('lastNavLink');
                
                this.router.navigate([targetRoute]);
            }),
            catchError(error => {
                console.error('Login failed', error);
                return throwError(() => error);
            })
        );
    }

    // Add helper method to check if route requires authentication
    private requiresAuth(route: string): boolean {
        const protectedRoutes = [
            '/chat',
            '/profile',
            '/change-password',
            '/character-creation',
            '/super-profile'
        ];
        return protectedRoutes.includes(route);
    }

    refreshToken(): Observable<any> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token found'));
        }
        return this.httpClient.post<any>(`${this.baseUrl}refresh/`, { refresh: refreshToken }).pipe(
            tap(response => {
                if (!response || !response.access) {
                    console.error('Invalid response structure:', response);
                    throw new Error('Token not provided');
                }
                this.setItem('token', response.access);
                this.startTokenExpirationTimer();
                this.startRefreshTokenExpirationTimer(); // Restart refresh token timer as well
            }),
            catchError(error => {
                console.error('Token refresh failed', error);
                this.logout();
                return throwError(() => new Error('Token refresh failed: ' + error.message));
            })
        );
    }

    loginForModal(username: string, password: string): Observable<any> {
        return this.httpClient.post<any>(`${this.baseUrl}login/`, { username, password }).pipe(
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

    updateUserProfile(data: any): Observable<any> {
        const token = this.getToken();
        if (!token) {
            return throwError(() => new Error('Authentication token not found'));
        }
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.httpClient.put(`${this.baseUrl}person/data/update/`, data, { headers }).pipe(
            catchError(error => throwError(() => new Error('Error updating profile: ' + error.message)))
        );
    }

    updateUserProfilePicture(profilePicture: FormData): Observable<any> {
        const token = this.getToken();
        if (!token) {
            console.error('No token found');
            return throwError(() => new Error('Authentication token not found'));
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${this.baseUrl}upload-profile-picture/`, profilePicture, { headers });
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


    private clearLocalStorage() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('username');
        }
    }

    logout(): Observable<any> {
        return of(null).pipe(
            tap(() => {
                const username = this.username.getValue(); // Get the current username
                this.clearLocalStorage();
                sessionStorage.removeItem('lastNavLink');
                localStorage.removeItem('rememberMe');
                this._isLoggedIn.next(false);
                this.username.next('');
                if (this.refreshTokenExpirationTimer) {
                    clearTimeout(this.refreshTokenExpirationTimer);
                }
                if (this.tokenExpirationTimer) {
                    clearTimeout(this.tokenExpirationTimer);
                }
                this.logoutEvent.emit(username); // Emit the username with the logout event
            })
        );
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

    getCharacterByIdAndUsername(_id: string, username: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}profile_display/characters/${_id}/${username}/`).pipe(
            catchError(error => {
                if (error.status === 404) {
                    return throwError(() => new Error('Character not found'));
                }
                return throwError(() => new Error('Error fetching character: ' + error.message));
            })
        );
    }

    blockUser(username: string): Observable<any> {
        return this.http.post(`${this.baseUrl}block-user/`, { username });
    }

    unblockUser(username: string): Observable<any> {
        return this.http.post(`${this.baseUrl}unblock-user/`, { username });
    }

    getCurrentUser(): Observable<any> {
        return this.http.get(`${this.baseUrl}current-user/`);
    }

    deleteUser(username: string): Observable<any> {
        const token = this.getToken();
        if (!token) {
            return throwError(() => new Error('Authentication token not found'));
        }
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        
        return this.http.delete(`${this.baseUrl}delete-user/`, {
            headers,
            body: { username }
        }).pipe(
            catchError(error => {
                console.error('Failed to delete user:', error);
                return throwError(() => new Error('Failed to delete user'));
            })
        );
    }
}
