import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InsuranceFormService } from '../../../api/services/insuranceForm/insurance-form.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../api/services/user/user.service';
import { UserResponseDto } from '../../../api/dtos/User/User-response-dto';
import { BehaviorSubject } from 'rxjs';
import { InsuranceFormResponseDto } from '../../../api/dtos/InsuranceForm/InsuranceForm-response-dto';
import { tap } from 'rxjs/operators';
import { ToastComponent } from "../../../components/toast/toast.component";

@Component({
  selector: 'app-schadeclaims-user',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  templateUrl: './schadeclaims-user.component.html',
  styleUrls: ['./schadeclaims-user.component.css'],
})
export class SchadeclaimsUserComponent implements OnInit {
  schadeclaims$ = new BehaviorSubject<InsuranceFormResponseDto[]>([]);
  user!: UserResponseDto | undefined;
  @ViewChild('toast') toast!: ToastComponent;
  toastMessage = '';
  toastClass = 'bg-green-500';
  toastHover = 'bg-green-400';

  constructor(
    private route: ActivatedRoute,
    private schadeclaimService: InsuranceFormService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        tap((params) => {
          const user = JSON.parse(localStorage.getItem('user')!); // Ingelogde gebruiker ophalen
          const targetUserId = +params['userId']; // Haal de userId uit de query parameters
  
          if (user?.id && targetUserId) {
            // Haal insuranceforms op voor de target gebruiker
            this.schadeclaimService
              .getInsuranceformsByUserIdByAccessToUserField(user.id, targetUserId)
              .subscribe({
                next: (claims) => {
                  this.schadeclaims$.next(claims); // Update de BehaviorSubject
                },
                error: (err) => {
                  console.error('Fout bij het ophalen van schadeclaims:', err);
                },
              });
  
            // Haal de informatie van de target gebruiker op
            this.userService.getAllUsers().subscribe({
              next: (users) => {
                this.user = users.find((u) => u.id === targetUserId);
              },
              error: (err) => {
                console.error('Fout bij het ophalen van gebruikers:', err);
              },
            });
          } else {
            console.warn(
              'Ongeldige parameters: user.id of targetUserId ontbreekt.'
            );
          }
        })
      )
      .subscribe();
  }

  // Helper method to update claim status
  // Helper method to update claim status
private updateClaimStatus(id: number, newStatus: number): void {
  this.schadeclaimService.getInsuranceformByClaimId(id).subscribe({
    next: (response: InsuranceFormResponseDto | InsuranceFormResponseDto[]) => {
      // Controleer of het een array is en haal het eerste object eruit
      const insuranceForm = Array.isArray(response) ? response[0] : response;

      if (!insuranceForm) {
        console.error('Geen geldig formulier gevonden.');
        return;
      }

      console.log('Opgehaald formulier:', insuranceForm);

      // Maak een bijgewerkt formulier aan
      const updatedForm: InsuranceFormResponseDto = {
        id: insuranceForm.id,
        damage: insuranceForm.damage,
        field: insuranceForm.field,
        startDate: insuranceForm.startDate,
        endDate: insuranceForm.endDate,
        estimated_cost: insuranceForm.estimated_cost,
        description: insuranceForm.description,
        insurance: insuranceForm.insurance,
        status: newStatus, // Update alleen de status
      };

      console.log('Bijgewerkt formulier:', updatedForm);

      // Stuur het bijgewerkte formulier naar de backend
      this.schadeclaimService.putInsuranceformById(id, updatedForm).subscribe({
        next: (updatedClaim) => {

          // Werk de lijst bij in de BehaviorSubject
          const updatedClaims = this.schadeclaims$.getValue().map((claim) =>
            claim.id === id ? updatedClaim : claim
          );
          this.schadeclaims$.next(updatedClaims);
        },
        error: (err) => {
          console.error('Fout bij het bijwerken van de claimstatus:', err);
        },
      });
    },
    error: (err) => {
      console.error('Fout bij het ophalen van het formulier:', err);
    },
  });
}


  // Request extra photos for the claim
  vraagFotos(id: number): void {
    this.updateClaimStatus(id, 4);
    this.toastMessage = "Extra foto's zijn gevraagd";
    this.toastClass = 'bg-green-500';
    this.toastHover = 'bg-green-400';
    this.toast.showToast();
  }

  // Approve the claim
  approveClaim(id: number): void {
    this.updateClaimStatus(id, 5);
    this.toastMessage = "U heeft deze schadeclaim goedgekeurd.";
    this.toastClass = 'bg-green-500';
    this.toastHover = 'bg-green-400';
    this.toast.showToast();
  }

  // Reject the claim
  rejectClaim(id: number): void {
    this.updateClaimStatus(id, 6);
    this.toastMessage = "U heeft deze schadeclaim afgekeurd";
    this.toastClass = 'bg-red-500';
    this.toastHover = 'bg-red-400';
    this.toast.showToast();
  }

  downloadPdf(id: number): void {
    this.toastMessage = "Uw pdf wordt gedownload.";
    this.toastClass = 'bg-green-500';
    this.toastHover = 'bg-green-400';
    this.toast.showToast();
  }
}
