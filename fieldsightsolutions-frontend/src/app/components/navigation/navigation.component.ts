import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationStart, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Emitters } from '../../Auth/emitters/emitters';
import { UserService } from '../../api/services/user/user.service';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent implements OnInit, OnDestroy {
  name = '';
  authenticated = false;
  isDropdownOpen = false;  // Track dropdown visibility
  private apiUrl = `${environment.baseUrl}`;
  private routerSubscription: any;
  public userRole: number = 0;

  constructor(private http: HttpClient, private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    // Check if user is authenticated from localStorage
    const storedAuthStatus = localStorage.getItem('authenticated');
    const storedUser = localStorage.getItem('user');

    if (storedAuthStatus && storedUser) {
      this.authenticated = JSON.parse(storedAuthStatus);
      const user = JSON.parse(storedUser);
      this.name = 'Hallo ' + user.firstName + '!';

      // Emit authentication state and user data
      Emitters.authEmitter.emit(this.authenticated);
      Emitters.userEmitter.emit(user);
    }

    // Listen to authentication state changes
    Emitters.authEmitter.subscribe((auth: boolean) => {
      this.authenticated = auth;

      if (auth) {
        this.fetchUserData();
      } else {
        this.name = ''; // Clear name if user is logged out
      }
    });

    // Listen to router events to close the dropdown on navigation
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isDropdownOpen = false;
      }
      if (event instanceof NavigationStart && this.authenticated) {
        this.checkUserRole();
      }
    });
  }

  private checkUserRole(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.userService.getUserById(user.id).subscribe({
        next: user => {
          this.userRole = user.userRole_id;
        }
      });
    }
  }


  ngOnDestroy(): void {
    // Unsubscribe from the router events
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Toggle dropdown visibility
  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();  // Prevent clicks from closing the dropdown
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Close the dropdown if user clicks outside of it
  @HostListener('document:click', ['$event'])
  closeDropdown(event: MouseEvent): void {
    const dropdown = document.getElementById('dropdown');
    const button = event.target as HTMLElement;

    if (dropdown && !dropdown.contains(button)) {
      this.isDropdownOpen = false;
    }
  }

  fetchUserData(): void {
    this.userService.getUser()
      .subscribe(
        (res: any) => {
          this.name = 'Hallo ' + res.firstName + '!';

          // Save authentication status and user data in localStorage
          localStorage.setItem('authenticated', 'true');
          localStorage.setItem('user', JSON.stringify(res));

          // Emit user data
          Emitters.userEmitter.emit(res);
        },
        err => {
          this.authenticated = false;
          this.name = '';
          localStorage.removeItem('authenticated');
          localStorage.removeItem('user');
        }
      );
  }

  logout(): void {
    const logoutUrl = `${environment.baseUrl}/logout`; // Use dynamic baseUrl from environment

    this.http.post(logoutUrl, {}, { withCredentials: true })
      .subscribe(() => {
        this.authenticated = false;
        this.name = '';

        // Remove authentication state and user data from localStorage
        localStorage.removeItem('authenticated');
        localStorage.removeItem('user');

        // Emit unauthenticated state
        Emitters.authEmitter.emit(false);
        Emitters.userEmitter.emit(null);

        // Reset dropdown state
        this.isDropdownOpen = false;

        this.router.navigate(['/login']);
      });
  }
}
