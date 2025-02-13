import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../api/services/user/user.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private userRole: number | null = null; // Gebruikersrol opslaan

  constructor(private userService: UserService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Voorkom redirect loop door de unauthorized route uit te sluiten
    if (state.url === '/unauthorized') {
      return of(true);
    }


    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user || !user.id) {
      this.router.navigate(['/unauthorized']);
      return of(false);
    }

    return this.userService.getUserById(user.id).pipe(
      map(userData => {
        const userRole = userData.userRole_id; // userRole is een nummer
        const expectedRole = route.data['role']; // Dit kan een nummer, array of functie zijn

        // Als expectedRole een functie is, voer deze uit
        if (typeof expectedRole === 'function' && expectedRole(userRole)) {
          return true;
        }

        // Als expectedRole een nummer of array is, check of userRole erin zit
        if (typeof expectedRole === 'number' && userRole === expectedRole) {
          return true;
        }

        if (Array.isArray(expectedRole) && expectedRole.includes(userRole)) {
          return true;
        }

        this.router.navigate(['/unauthorized']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/unauthorized']);
        return of(false);
      })
    );
  }
}
