import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Emitters } from '../emitters/emitters';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './inlogandregister.component.html',
  styleUrls: ['./inlogandregister.component.css']
})
export class AuthComponent implements OnInit {

  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isLoginMode: boolean = true; // Toggle between login and register

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    // Initialize login form
    this.loginForm = this.formBuilder.group({
      email: '',
      password: ''
    });

    // Initialize register form
    this.registerForm = this.formBuilder.group({
      firstName: '',
      lastName: '',
      email: '',
      adres: '',
      gemeente: '',
      password: ''
    });
  }

  // Toggle between login and register modes
  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
  }

  // Submit the login form
  loginSubmit(): void {
    this.http.post('http://localhost:8000/api/login', this.loginForm.getRawValue(), { withCredentials: true })
      .subscribe({
        next: () => {
          this.fetchUserData();
        },
        error: (err) => {
          console.error('Login failed', err);
        }
      });
  }

  // Submit the register form
  registerSubmit(): void {
    this.http.post('http://localhost:8000/api/register', this.registerForm.getRawValue())
      .pipe(
        switchMap(() => this.http.post('http://localhost:8000/api/login', this.registerForm.getRawValue(), { withCredentials: true }))
      )
      .subscribe({
        next: () => {
          this.fetchUserData();
        },
        error: (err) => {
          console.error('Registration or Login failed', err);
        }
      });
  }

  // Fetch user data and handle authentication
  private fetchUserData(): void {
    this.http.get('http://localhost:8000/api/user', { withCredentials: true })
      .subscribe((user: any) => {
        Emitters.authEmitter.emit(true);
        Emitters.userEmitter.emit(user);

        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('user', JSON.stringify(user));

        this.router.navigate(['/']);
      });
  }
}
