import { Component, Input } from '@angular/core';
import { FieldResponsetDto } from '../../api/dtos/Field/Field-response-dto';
import { WeatherIconComponent } from '../weather-icon/weather-icon.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-perceelknop',
  standalone: true,
  imports: [WeatherIconComponent],
  templateUrl: './perceelknop.component.html',
  styleUrl: './perceelknop.component.css'
})
export class PerceelknopComponent {

  @Input() perceel!: FieldResponsetDto;
  @Input() userRole!: number;

}
