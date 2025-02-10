import { Component, Input } from '@angular/core';
import { InsuranceFormResponseDto } from '../../api/dtos/InsuranceForm/InsuranceForm-response-dto';

@Component({
  selector: 'app-claim-knop',
  standalone: true,
  imports: [],
  templateUrl: './claim-knop.component.html',
  styleUrl: './claim-knop.component.css'
})
export class ClaimKnopComponent {

  @Input() claim!: InsuranceFormResponseDto;

}
