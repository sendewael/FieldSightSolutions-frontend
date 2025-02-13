import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InsuranceFormService } from '../../api/services/insuranceForm/insurance-form.service';
import { ImageService } from '../../api/services/image/image.service';
import { PDFService } from '../../api/services/pdf/pdf.service';
import { Emitters } from '../../Auth/emitters/emitters';
import { environment } from '../../../environments/environment.development';
@Component({
  selector: 'app-schadeclaims',
  templateUrl: './schadeclaims.component.html',
  styleUrls: ['./schadeclaims.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]  // Add CommonModule here
})
export class SchadeclaimsComponent implements OnInit {
  name = '';
  authenticated = false;

  claims: any[] = [];  // Store the insurance claims
  userId: number | null = null;  // Store the user ID

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private insuranceformservice: InsuranceFormService,
    private imageService: ImageService,
    private pdfService: PDFService

  ) { }

  ngOnInit(): void {
    console.log(this.claims);
  
    // Get the logged-in user data (you can get this from localStorage or cookies)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
  
    if (user && user.id) {
      this.userId = user.id;  // Set the user ID from the logged-in user data
      this.fetchInsuranceClaims(user.id);  // Fetch claims for this user
    } else {
      // Handle case where the user is not logged in or no user data is found
      this.router.navigate(['/login']);
    }
  }
  

  fetchInsuranceClaims(userId: number): void {
    // Make the API call to get insurance claims based on the user ID
    this.insuranceformservice.getInsuranceformByUserId(userId)
      .subscribe({
        next: (response: any) => {
          this.claims = response;  // Assign the response data to the claims array
        },
        error: (err) => {
          console.error('Failed to fetch insurance claims', err);
  
          // Check if the error is related to the "No UserField found for this user" error
          if (err?.error?.detail && err.error.detail.includes("No UserField found for this user")) {
            console.warn("UserField not found, but not logging out.");
            // Handle the case where there is no UserField (optional, depending on your needs)
          } else {
            // If error is not related to missing UserField, log out the user
            const logoutUrl = `${environment.baseUrl}/logout`; // Use dynamic baseUrl from environment
  
            this.http.post(logoutUrl, {}, { withCredentials: true })
              .subscribe(() => {
                this.authenticated = false;
                this.name = '';
  
                // Remove authentication state and user data from localStorage
                localStorage.removeItem('authenticated');
                localStorage.removeItem('user');
  
                // Emit unauthenticated state
                Emitters.authEmitter.emit(false);
                Emitters.userEmitter.emit(null);
  
                this.router.navigate(['/login']);
              });
          }
        }
      });
  }
  

  editClaim(claimId: number): void {
    this.router.navigate(['/edit-schadeclaim', claimId]); // Pass claim ID in route
  }

  generatePDF(claimId: number): void {
    this.pdfService.getPDF(claimId)
      .subscribe({
        next: (response) => {
          // Create a downloadable link for the PDF
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `claim_${claimId}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Failed to generate PDF', err);
        }
      });
  }
}
