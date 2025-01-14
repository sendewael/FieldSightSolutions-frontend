import { Component, Input } from '@angular/core';
import { FieldResponsetDto } from '../../api/dtos/Field/Field-response-dto';

@Component({
  selector: 'app-perceelknop',
  standalone: true,
  imports: [],
  templateUrl: './perceelknop.component.html',
  styleUrl: './perceelknop.component.css'
})
export class PerceelknopComponent {

  @Input() perceel!: FieldResponsetDto;

}
