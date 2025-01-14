import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, FormGroup } from '@Angular/forms'
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Emitters } from '../emitters/emitters';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  form!: FormGroup;

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router) {

  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: '',
      password: ''
    })
  }


  submit(): void {
    this.http.post('http://localhost:8000/api/login', this.form.getRawValue(), { withCredentials: true })
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
          console.error('Login failed', err);
        }
      });
  }
  
  

}
