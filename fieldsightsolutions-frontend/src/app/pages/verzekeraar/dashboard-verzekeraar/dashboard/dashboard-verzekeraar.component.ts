import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserResponseDto } from '../../../../api/dtos/User/User-response-dto';
import { UserService } from '../../../../api/services/user/user.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InsuranceFormService } from '../../../../api/services/insuranceForm/insurance-form.service';

@Component({
  selector: 'app-dashboard-verzekeraar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-verzekeraar.component.html',
  styleUrl: './dashboard-verzekeraar.component.css'
})
export class DashboardVerzekeraarComponent implements OnInit{

  userList$!: Observable<UserResponseDto[]>;

  constructor(
    private UserService: UserService,
    private router: Router,
    private schadeclaimService: InsuranceFormService
  ) {}

  ngOnInit(): void {
    this.userList$ = this.UserService.getAllUsers();
  }

  bekijkSchadeclaim(userId: number) {
    this.schadeclaimService.getInsuranceclaimsByUserId(userId).subscribe(
      (schadeclaims) => {
        // Optioneel: Log de schadeclaims of voer extra acties uit
        console.log(schadeclaims);

        // Navigeer naar de schadeclaim-pagina
        this.router.navigate(['/verzekeraar/schadeclaims'], {
          queryParams: { userId: userId }, // Voeg eventueel query parameters toe
        });
      },
      (error) => {
        console.error('Error fetching schadeclaims:', error);
      }
    );
  }
}
