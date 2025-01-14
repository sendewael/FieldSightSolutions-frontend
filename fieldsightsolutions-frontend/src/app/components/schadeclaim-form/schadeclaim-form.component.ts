import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schadeclaim-form',
  templateUrl: './schadeclaim-form.component.html',
  styleUrls: ['./schadeclaim-form.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SchadeclaimFormComponent implements OnInit {
  schadeclaimForm = {
    fieldName: '',
    fieldCrop: '',
    fieldMunicipality: '',
    fieldPostcode: '',
    fieldArea: '',
    farmerFirstname: '',
    farmerName: '',
    farmerStreet: '',
    farmerNumber: '',
    farmerMunicipality: '',
    farmerPostcode: '',
    farmerEmail: '',
    damageDateStart: '',
    damageDateEnd: '',
    damageType: '',
    damageAmount: '',
    weatherInsurance: '',
    photos: null,
    additionalInfo: '',
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchUserData();
  }

  fetchUserData(): void {
    this.http.get('http://localhost:8000/api/user', { withCredentials: true })
      .subscribe({
        next: (data: any) => {
          console.log('User data fetched:', data);

          // Split 'adres' into street and number
          const adres = data.adres || '';
          const [street, ...numberParts] = adres.split(/(?=\d)/); // Split at the start of the first number
          const number = numberParts.join('') || ''; // Join remaining parts as the number


          this.schadeclaimForm.farmerFirstname = data.firstName || '';
          this.schadeclaimForm.farmerName = data.lastName || '';
          this.schadeclaimForm.farmerStreet = street.trim();
          this.schadeclaimForm.farmerNumber = number.trim();
          this.schadeclaimForm.farmerMunicipality = data.gemeente || '';
          this.schadeclaimForm.farmerEmail = data.email || '';
        },
        error: (err) => {
          console.error('Error fetching user data:', err);
        },
      });
  }

  onSubmit(): void {
    console.log(this.schadeclaimForm);
    this.http.post('/api/submit-claim', this.schadeclaimForm) // Replace with your actual endpoint
      .subscribe(response => {
        console.log('Form submitted successfully', response);
      });
  }
}
