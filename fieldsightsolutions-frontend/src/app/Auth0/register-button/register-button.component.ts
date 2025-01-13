import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
@Component({
  selector: 'app-register-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register-button.component.html',
  styleUrl: './register-button.component.css'
})
export class RegisterButtonComponent {
  constructor(private auth: AuthService) {}

  handleSignUp(): void {
    this.auth.loginWithRedirect({
      appState: {
        target: "/",
      },
      authorizationParams: {
        prompt: "login",
        screen_hint: "signup",
      },
    });
  }
}
