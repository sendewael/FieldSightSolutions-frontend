import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-schadeclaim-form',
  templateUrl: './schadeclaim-form.component.html',
  styleUrls: ['./schadeclaim-form.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SchadeclaimFormComponent implements OnInit {
  userId: number | undefined;
  claimId: number | undefined;
  fields: any[] = []; // Array to store fields
  damages: any[] = []; // Array to store fields


  schadeclaimForm = {
    damage: "0",
    field: 1,
    startDate: "",
    endDate: "",
    active: true,
    estimated_cost: 0,
    additionalInfo: "",
    photos: "",
    weatherInsurance: false,
    fieldArea: "",
    fieldPostcode: " ",
    fieldCrop: "",
    fieldName: "",
    fieldMunicipality: ""
  };

  user = {
    farmerFirstname: '',
    farmerName: '',
    farmerStreet: '',
    farmerNumber: '',
    farmerMunicipality: '',
    farmerPostcode: '',
    farmerEmail: '',
  };

  postform = {
    damage: 0,
    field: 1,
    startDate: "",
    endDate: "",
    active: true,
    estimated_cost: 0
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute // ActivatedRoute to get route parameters
  ) { }

  ngOnInit(): void {
    this.fetchUserData();
    this.fetchFields(); // Fetch available fields
    this.fetchDamages(); // Fetch available damage types


    // Check for claim ID in route parameters
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.claimId = +params['id']; // Get claim ID from route
        this.fetchClaimData(this.claimId); // Fetch claim details
      }
    });
  }

  fetchFields(): void {
    this.http.get<any[]>('http://localhost:8000/api/fields/all', { withCredentials: true })
      .subscribe(
        (fields: any[]) => {
          this.fields = fields;
        },
        (err) => {
          console.error('Error fetching fields:', err);
        }
      );
  }

  fetchDamages(): void {
    this.http.get<any[]>('http://localhost:8000/api/damages/all', { withCredentials: true })
      .subscribe(
        (damages: any[]) => {
          this.damages = damages; // Populate damages array
        },
        (err) => {
          console.error('Error fetching damages:', err);
        }
      );
  }

  fetchUserData(): void {
    this.http.get('http://localhost:8000/api/user', { withCredentials: true })
      .subscribe({
        next: (data: any) => {
          this.userId = data.id;
          const adres = data.adres || '';
          const [street, ...numberParts] = adres.split(/(?=\d)/);
          const number = numberParts.join('') || '';
          this.user.farmerFirstname = data.firstName || '';
          this.user.farmerName = data.lastName || '';
          this.user.farmerStreet = street.trim();
          this.user.farmerNumber = number.trim();
          this.user.farmerMunicipality = data.gemeente || '';
          this.user.farmerEmail = data.email || '';
        },
        error: (err) => {
          console.error('Error fetching user data:', err);
        },
      });
  }

  fetchClaimData(claimId: number): void {
    this.http.get(`http://localhost:8000/api/insurance-claims/id/${claimId}/`, { withCredentials: true })
      .subscribe({
        next: (claim: any) => {
          // Map claim data to the form
          this.schadeclaimForm.damage = String(claim[0].damage) || "0"; // Store as a string for dropdown
          this.schadeclaimForm.field = claim[0].id || 1;
          this.schadeclaimForm.startDate = claim[0].startDate || '';
          this.schadeclaimForm.endDate = claim[0].endDate || '';
          this.schadeclaimForm.active = claim[0].active || true;
          this.schadeclaimForm.estimated_cost = claim[0].estimated_cost || 0;
          this.schadeclaimForm.field = claim[0].field || 0;

          console.log(claim)

        },
        error: (err) => {
          console.error('Error fetching claim data:', err);
        },

      });

    this.http.get(`http://localhost:8000/api/fields/1/`, { withCredentials: true })
      .subscribe({
        next: (field: any) => {
          this.schadeclaimForm.fieldArea = field[0].acreage || '';
          this.schadeclaimForm.fieldPostcode = field[0].postalcode || '';
          this.schadeclaimForm.fieldCrop = field[0].fieldCrop || '';
          this.schadeclaimForm.fieldName = field[0].name || '';
          this.schadeclaimForm.fieldMunicipality = field[0].municipality || '';
        },
        error: (err) => {
          console.error('Error fetching claim data:', err);
        },

      });

  }



  onSubmit(): void {


    const formData = {
      ...this.postform,
      damage: Number(this.schadeclaimForm.damage), // Convert to number for backend
      field: this.schadeclaimForm.field,
      estimated_cost: this.schadeclaimForm.estimated_cost || 0,
      startDate: this.schadeclaimForm.startDate,
      endDate: this.schadeclaimForm.endDate,
    };

    console.log(formData);

    this.http.post(`http://localhost:8000/api/insurance-claims/${this.userId}`, formData, { withCredentials: true })
      .subscribe({
        next: (response) => {
          console.log('Form submitted successfully', response);
          this.router.navigate(['/schadeclaims']);
        },
        error: (err) => {
          console.error('Error submitting claim:', err);
        }
      });
  }
}
