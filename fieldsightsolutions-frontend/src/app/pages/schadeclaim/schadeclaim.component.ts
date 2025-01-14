import { Component } from '@angular/core';
import { SchadeclaimFormComponent } from "../../components/schadeclaim-form/schadeclaim-form.component";

@Component({
  selector: 'app-schadeclaim',
  standalone: true,
  imports: [SchadeclaimFormComponent],
  templateUrl: './schadeclaim.component.html',
  styleUrl: './schadeclaim.component.css'
})
export class SchadeclaimComponent {

}
