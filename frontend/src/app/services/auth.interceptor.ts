import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    let authReq = req;

    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = this.authService.getToken();
              if (newToken) {
                authReq = req.clone({
                  headers: req.headers.set('Authorization', `Bearer ${newToken}`)
                });
                return next.handle(authReq);
              }
              return throwError(() => new Error('Token refresh failed'));
            }),
            catchError(refreshError => {
              this.authService.logout().subscribe(() => {
                this.router.navigate(['/homepage'], { queryParams: { returnUrl: this.router.url } });
              });
              return throwError(() => new Error(refreshError.message));
            })
          );
        } else if (error.status === 500) {
          console.error('Server error:', error.message);
          // Optionally, you can navigate to an error page or show a toast message
        }
        return throwError(() => new Error(error.message));
      })
    );
  }
}