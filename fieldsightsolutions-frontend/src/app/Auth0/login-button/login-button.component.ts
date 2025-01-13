import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';


@Component({
  selector: 'app-login-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-button.component.html',
  styleUrl: './login-button.component.css'
})
export class LoginButtonComponent {
  constructor(private auth: AuthService) { }

  handleLogin(): void {
    this.auth.loginWithRedirect({
      appState: {
        target: '/',
      },
      authorizationParams: {
        prompt: 'login',  
      },
    });
  }

}
