import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Emitters } from '../../Auth/emitters/emitters';
import { UserService } from '../../api/services/user/user.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent implements OnInit {
  name = '';
  authenticated = false;
  isDropdownOpen = false;  // Track dropdown visibility

  constructor(private http: HttpClient, private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    // Check if user is authenticated from localStorage
    const storedAuthStatus = localStorage.getItem('authenticated');
    const storedUser = localStorage.getItem('user');

    if (storedAuthStatus && storedUser) {
      this.authenticated = JSON.parse(storedAuthStatus);
      const user = JSON.parse(storedUser);
      this.name = 'Hallo ' + user.firstName;

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
          this.name = 'Hallo ' + res.firstName;

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
        this.router.navigate(['/login']);
      });
  }
}
