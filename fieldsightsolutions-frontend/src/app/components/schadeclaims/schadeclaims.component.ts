import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InsuranceFormService } from '../../api/services/insuranceForm/insurance-form.service';
import { ImageService } from '../../api/services/image/image.service';
import { PDFService } from '../../api/services/pdf/pdf.service';
import { LoaderComponent } from '../loader/loader.component';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-schadeclaims',
  templateUrl: './schadeclaims.component.html',
  styleUrls: ['./schadeclaims.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, LoaderComponent, FormsModule,]  // Add CommonModule here
})
export class SchadeclaimsComponent implements OnInit {
  claims: any[] = [];  // Store the insurance claims
  userId: number | null = null;  // Store the user ID
  isLoading: boolean = false;

  filterText: string = '';
  filterFromDate: string = '';
  filterToDate: string = '';
  filterStatus: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private insuranceformservice: InsuranceFormService,
    private imageService: ImageService,
    private pdfService: PDFService,

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
    this.isLoading = true;
    // Make the API call to get insurance claims based on the user ID
    this.insuranceformservice.getInsuranceformByUserId(userId)
      .subscribe({
        next: (response: any) => {
          this.claims = response;  // Assign the response data to the claims array
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to fetch insurance claims', err);
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

  get filteredClaims() {
    return this.claims.filter((claim) => {
      const matchesName =
        !this.filterText ||
        claim.field.name.toLowerCase().includes(this.filterText.toLowerCase());

      const matchesDateRange =
        (!this.filterFromDate || new Date(claim.startDate) >= new Date(this.filterFromDate)) &&
        (!this.filterToDate || new Date(claim.endDate) <= new Date(this.filterToDate));

      const matchesStatus =
        !this.filterStatus || claim.status.toString() === this.filterStatus;

      return matchesName && matchesDateRange && matchesStatus;
    });
  }

  clearFilterText() {
    this.filterText = '';
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 1:
        return 'openstaand';
      case 2:
        return 'bezig';
      default:
        return 'onbekend';
    }
  }
}
