import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InsuranceFormService } from '../../api/services/insuranceForm/insurance-form.service';
import { ImageService } from '../../api/services/image/image.service';
import { PDFService } from '../../api/services/pdf/pdf.service';
import { environment } from '../../../environments/environment.development';
import { LoaderComponent } from '../loader/loader.component';
import { FormsModule } from '@angular/forms';
import { RequestedImageService } from '../../api/services/requestedImage/requestedImage.service';
import { Emitters } from '../../Auth/emitters/emitters';

@Component({
  selector: 'app-schadeclaims',
  templateUrl: './schadeclaims.component.html',
  styleUrls: ['./schadeclaims.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, LoaderComponent, FormsModule,]  // Add CommonModule here
})
export class SchadeclaimsComponent implements OnInit {
  name = '';
  authenticated = false;

  claims: any[] = [];  // Store the insurance claims
  userId: number | null = null;  // Store the user ID
  isLoading: boolean = false;

  filterText: string = '';
  filterFromDate: string = '';
  filterToDate: string = '';
  filterStatus: string = '';

  requestedImages: {
    claimId: number;
    file: File | null;
    url: string;
    xCord?: string | number;
    yCord?: string | number;
  }[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private insuranceformservice: InsuranceFormService,
    private imageService: ImageService,
    private pdfService: PDFService,
    private requestedImageService: RequestedImageService

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

  claimHasEOPlazaImages: { [key: number]: boolean } = {};

  fetchInsuranceClaims(userId: number): void {
    this.isLoading = true;
    // Make the API call to get insurance claims based on the user ID
    this.insuranceformservice.getInsuranceformByUserId(userId)
      .subscribe({
        next: (response: any) => {
          // Ensure claims is always an array to avoid "forEach is not a function" error
          this.claims = Array.isArray(response) ? response : [];

          this.claims.forEach(claim => {
            this.requestedImageService.getImages(claim.id).subscribe(images => {
              const unfulfilledImages = images.filter(image => !image.fulfilled);

              this.requestedImages.push(...unfulfilledImages.map(image => ({
                claimId: claim.id,
                file: null,
                url: "no url",
                xCord: image.xCord,
                yCord: image.yCord,
              })));
            });

            this.imageService.getEOplazaImages(claim.id).subscribe(eoplazaResponse => {
              if (eoplazaResponse.images.length > 0) {
                this.claimHasEOPlazaImages[claim.id] = true;
              } else {
                this.claimHasEOPlazaImages[claim.id] = false;
              }
            });
          });

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to fetch insurance claims', err);

          // Check if the error is related to "No UserField found for this user" error
          if (err?.error?.detail && err.error.detail.includes("No UserField found for this user")) {
            console.warn("UserField not found, but not logging out.");
            // Handle case where there is no UserField (optional, depending on your needs)
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

          this.isLoading = false; // Stop loading in case of an error
        }
      });
}

  hasEOPlazaImages(claimId: number): boolean {
    return this.claimHasEOPlazaImages[claimId] ?? false;
  }



  hasRequestedImages(claimId: number): boolean {
    return this.requestedImages.some(img => img.claimId === claimId);
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

  generateEOPlazaPDF(claimId: number): void {
    this.pdfService.getEOplazaPDF(claimId)
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
    return this.claims
      .slice() // Maak een kopie om mutatie te voorkomen
      .sort((a, b) => {
        const hasImagesA = this.hasRequestedImages(a.id) ? 1 : 0;
        const hasImagesB = this.hasRequestedImages(b.id) ? 1 : 0;

        // Eerst sorteren op aanwezigheid van requestedImages (1 boven 0)
        if (hasImagesA !== hasImagesB) {
          return hasImagesB - hasImagesA;
        }

        // Daarna sorteren op ID (nieuwe claims eerst, dus de hoogste ID bovenaan)
        return b.id - a.id;  // Sorteren van hoogste naar laagste ID
      })
      .filter((claim) => {
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
