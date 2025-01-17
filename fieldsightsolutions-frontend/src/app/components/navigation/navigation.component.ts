import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Emitters } from '../../Auth/emitters/emitters';

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

  constructor(private http: HttpClient) {}

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

  fetchUserData(): void {
    this.http.get('http://localhost:8000/api/user', { withCredentials: true })
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
    this.http.post('http://localhost:8000/api/logout', {}, { withCredentials: true })
      .subscribe(() => {
        this.authenticated = false;
        this.name = '';

        // Remove authentication state and user data from localStorage
        localStorage.removeItem('authenticated');
        localStorage.removeItem('user');

        // Emit unauthenticated state
        Emitters.authEmitter.emit(false);
        Emitters.userEmitter.emit(null);

      });
  }
}
