import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, FormGroup } from '@Angular/forms'
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Emitters } from '../emitters/emitters';
import { switchMap } from 'rxjs';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  form!: FormGroup;

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router) {

  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      firstName: '',
      lastName: '',
      email: '',
      adres: "",
      gemeente: "",
      password: '',

    });
  }

  submit(): void {
    this.http.post('http://localhost:8000/api/register', this.form.getRawValue())
      .pipe(
        switchMap(() => this.http.post('http://localhost:8000/api/login', this.form.getRawValue(), { withCredentials: true }))
      )
      .subscribe({
        next: () => {
          // Fetch the user data after login
          this.http.get('http://localhost:8000/api/user', { withCredentials: true })
            .subscribe((user: any) => {
              // Emit authentication status
              Emitters.authEmitter.emit(true);
              // Emit user data
              Emitters.userEmitter.emit(user);
  
              // Save authentication status and user data in localStorage
              localStorage.setItem('authenticated', 'true');
              localStorage.setItem('user', JSON.stringify(user));
  
              // Navigate to the home page
              this.router.navigate(['/']);
            });
        },
        error: (err) => {
          console.error('Registration or Login failed', err);
        }
      });
  }
  
  

}
