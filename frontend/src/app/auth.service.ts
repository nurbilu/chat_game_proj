import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://localhost:8000/';

    constructor(private http: HttpClient) { }

    register(username: string, password: string, email: string, address: string, birthdate: string): Observable<any> {
        return this.http.post(`${this.baseUrl}register/`, { username, password, email, address, birthdate });
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post(`${this.baseUrl}login/`, { username, password });
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

    updateUserProfile(username: string, email: string, address: string, birthdate: string): Observable<any> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${this.baseUrl}profile/${username}/`, { email, address, birthdate }, { headers });
    }
}
