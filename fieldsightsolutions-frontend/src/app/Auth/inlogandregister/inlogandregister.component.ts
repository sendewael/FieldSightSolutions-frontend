import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Emitters } from '../emitters/emitters';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../../components/toast/toast.component';
import { environment } from '../../../environments/environment.development';
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, ToastComponent],
  templateUrl: './inlogandregister.component.html',
  styleUrls: ['./inlogandregister.component.css'],
})
export class AuthComponent implements OnInit {
  private apiUrl = `${environment.baseUrl}`;

  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isLoginMode: boolean = true;

  @ViewChild(ToastComponent) toast!: ToastComponent; // Reference to ToastComponent

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize login form
    this.loginForm = this.formBuilder.group({
      email: '',
      password: '',
    });

    // Initialize register form
    this.registerForm = this.formBuilder.group({
      firstName: '',
      lastName: '',
      email: '',
      adres: '',
      gemeente: '',
      password: '',
      bus: '',
    });
  }

  // Toggle between login and register modes
  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
  }

  // Submit the login form
  loginSubmit(): void {
    this.http
      .post(`${this.apiUrl}/login`, this.loginForm.getRawValue(), {
        withCredentials: true,
      })
      .subscribe({
        next: () => {
          this.fetchUserData();
        },
        error: (err) => {
          console.error('Login failed', err);
          this.toast.message = 'Wachtwoord of email is onjuist'; // Set toast message
          this.toast.toastClass = 'bg-red-500'; // Optional: set error styling
          this.toast.showToast(); // Show toast
        },
      });
  }

  // Submit the register form
  registerSubmit(): void {
    this.http
      .post(`${this.apiUrl}/register`, this.registerForm.getRawValue())
      .pipe(
        switchMap(() =>
          this.http.post(
            `${this.apiUrl}/login`,
            this.registerForm.getRawValue(),
            { withCredentials: true }
          )
        )
      )
      .subscribe({
        next: () => {
          this.fetchUserData();
        },
        error: (err) => {
          console.error('Registration or Login failed', err);
          this.toast.message = 'Registratie mislukt'; // Set toast message
          this.toast.toastClass = 'bg-red-500'; // Optional: set error styling
          this.toast.showToast(); // Show toast
        },
      });
  }

  // Fetch user data and handle authentication
  private fetchUserData(): void {
    this.http
      .get(`${this.apiUrl}/user`, { withCredentials: true })
      .subscribe((user: any) => {
        Emitters.authEmitter.emit(true);
        Emitters.userEmitter.emit(user);

        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('user', JSON.stringify(user));

        if (user.userRole_id === 4) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      });
  }
}
