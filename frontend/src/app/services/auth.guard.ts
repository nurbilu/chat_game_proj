import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private jwtHelper: JwtHelperService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkLogin();
  }

  private checkLogin(): Observable<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      if (this.authService.isLoggedIn()) {
        return of(true);
      } else {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          return this.authService.refreshToken().pipe(
            switchMap(() => of(true)),
            catchError(() => {
              this.router.navigate(['/homepage']);
              return of(false);
            })
          );
        } else {
          this.router.navigate(['/homepage']);
          return of(false);
        }
      }
    } else {
      console.error('Local storage is not available');
      return of(false);
    }
  }
}