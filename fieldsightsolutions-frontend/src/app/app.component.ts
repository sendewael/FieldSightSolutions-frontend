import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { NavigationComponent } from './components/navigation/navigation.component';
import { FooterComponent } from "./components/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FieldSightSolutions';

  constructor(public router: Router) { }
}
