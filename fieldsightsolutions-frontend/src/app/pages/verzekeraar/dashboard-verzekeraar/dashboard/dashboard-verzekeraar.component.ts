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
export class DashboardVerzekeraarComponent implements OnInit {
  userList$!: Observable<UserResponseDto[]>;

  constructor(
    private userService: UserService,
    private router: Router,
    private schadeclaimService: InsuranceFormService
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user')!);  // Haal de gebruiker op uit localStorage
    if (user && user.id) {
      // Voeg de userId toe aan de API-aanroep
      this.userList$ = this.userService.getUsersByAccessToUserField(user.id);
    } else {
      console.error('User not found in localStorage');
    }
  }
  

  bekijkSchadeclaim(userId: number) {
    const user = JSON.parse(localStorage.getItem('user')!);
    this.schadeclaimService.getInsuranceformsByUserIdByAccessToUserField(user.id, userId).subscribe(
      (schadeclaims) => {
        // Log de schadeclaims voor debugging
        console.log(schadeclaims);

        // Navigeer naar de schadeclaim-pagina
        this.router.navigate(['/verzekeraar/schadeclaims'], {
          queryParams: { userId: userId },
        });
      },
      (error) => {
        console.error('Error fetching schadeclaims:', error);
      }
    );
  }
}
