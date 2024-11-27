import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { switchMap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private publicRoutes = ['/login', '/homepage', '/library', '/about', '/register'];
  private blockedUserRoutes = ['/login', '/homepage'];

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
    return this.checkLogin(state.url);
  }

  private checkLogin(url: string): Observable<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      // Check if user is logged in
      if (this.authService.isLoggedIn()) {
        return this.authService.getCurrentUser().pipe(
          map(user => {
            if (user && user.is_blocked) {
              // Blocked users can only access login and homepage
              if (this.blockedUserRoutes.includes(url)) {
                return true;
              }
              this.router.navigate(['/access-denied']);
              return false;
            }
            
            // Check for saved navigation link
            const savedNavLink = sessionStorage.getItem('lastNavLink');
            if (savedNavLink) {
              this.router.navigate([savedNavLink]);
              sessionStorage.removeItem('lastNavLink');
            }
            
            return true;
          })
        );
      } else {
        // No user logged in
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          return this.authService.refreshToken().pipe(
            switchMap(() => of(true)),
            catchError(() => {
              // If public route, allow access
              if (this.publicRoutes.includes(url)) {
                return of(true);
              }
              this.router.navigate(['/login']);
              return of(false);
            })
          );
        } else {
          // If public route, allow access
          if (this.publicRoutes.includes(url)) {
            return of(true);
          }
          this.router.navigate(['/login']);
          return of(false);
        }
      }
    } else {
      console.error('Local storage is not available');
      return of(false);
    }
  }
}
