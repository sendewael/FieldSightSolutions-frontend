import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../api/services/user/user.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InsuranceFormService } from '../../../api/services/insuranceForm/insurance-form.service';
import { FieldService } from '../../../api/services/field/field.service';
import { DashboardMapComponent } from '../../../components/dashboard-map/dashboard-map.component';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  gemeente: string;
}

interface Field {
  id: number;
  name: string;
  crop: string;
  acreage: string;
}

interface Claims {}

interface Gemeente {
  name: string;
}

@Component({
  selector: 'app-dashboard-overheid',
  standalone: true,
  imports: [CommonModule, DashboardMapComponent, FormsModule],
  templateUrl: './dashboard-overheid.component.html',
  styleUrls: ['./dashboard-overheid.component.css']
})
export class DashboardOverheidComponent implements OnInit {
  user: User | null = null;
  fields: Field[] = [];
  claims: Claims[] = [];
  gemeentes: Gemeente[] = [];
  selectedGemeente: string = 'Geel';

  constructor(
    private userService: UserService,
    private router: Router,
    private schadeclaimService: InsuranceFormService,
    private fieldService: FieldService
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      if (this.user) {
        this.selectedGemeente = this.user.gemeente || 'Geel';
        this.getFields(this.selectedGemeente);
        console.log('b',this.gemeentes)
      }
    }
    this.getGemeentes();
  }

  getFields(gemeentenaam: string) {
    this.fieldService.getFieldsByGemeente(gemeentenaam).subscribe(
      (fields: Field[]) => {
        this.fields = fields;
        console.log('Fields:', this.fields);
        this.getClaimsForAllFields();
      },
      (error) => {
        console.error('Error fetching fields:', error);
      }
    );
  }

  getGemeentes() {
    this.fieldService.getFieldGemeentes().subscribe(
      (gemeentes: Gemeente[]) => {
        this.gemeentes = gemeentes;
        console.log('gemeentes', this.gemeentes);
      },
      (error) => {
        console.error('Error fetching gemeentes:', error);
      }
    );
  }

  onGemeenteChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    console.log('Selected Gemeente (from dropdown):', selectedValue);  // Check the value
    this.selectedGemeente = selectedValue;
    this.getFields(this.selectedGemeente);  // Make sure selectedGemeente is passed correctly
  }
  
  

  getClaimsForAllFields() {
    if (this.fields.length === 0) {
      console.log('No fields found');
      return;
    }

    const claimsRequests = this.fields.map(field =>
      this.schadeclaimService.getInsuranceClaimsByFieldId(field.id)
    );

    forkJoin(claimsRequests).subscribe(
      (claimsResponses) => {
        this.claims = claimsResponses.flat();
        console.log('All Claims:', this.claims);
      },
      (error) => {
        console.error('Error fetching claims:', error);
      }
    );
  }
}