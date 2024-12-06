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
    if (req.url.includes('reset-password')) {
      const resetToken = localStorage.getItem('temp_reset_token');
      if (resetToken) {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${resetToken}`)
        });
        return next.handle(authReq);
      }
      return next.handle(req);
    }

    const token = this.authService.getToken();
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return this.handleUnauthorizedError(req, next);
          }
          return throwError(() => error);
        })
      );
    }
    return next.handle(req);
  }

  private handleUnauthorizedError(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap(() => {
        const newToken = this.authService.getToken();
        if (newToken) {
          const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${newToken}`)
          });
          return next.handle(authReq);
        }
        return throwError(() => new Error('Token refresh failed'));
      }),
      catchError(refreshError => {
        this.authService.logout().subscribe(() => {
          this.router.navigate(['/login']);
        });
        return throwError(() => refreshError);
      })
    );
  }
}