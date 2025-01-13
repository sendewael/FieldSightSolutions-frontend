import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginButtonComponent } from './Auth0/login-button/login-button.component';
import { RegisterButtonComponent } from './Auth0/register-button/register-button.component';
import { LogoutButtonComponent } from './Auth0/logout-button/logout-button.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginButtonComponent, RegisterButtonComponent, LogoutButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fieldsightsolutions-frontend';
}
