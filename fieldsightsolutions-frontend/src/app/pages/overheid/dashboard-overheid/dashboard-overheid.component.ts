import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../api/services/user/user.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InsuranceFormService } from '../../../api/services/insuranceForm/insurance-form.service';
import { FieldService } from '../../../api/services/field/field.service';

interface User {
  id: number;
  gemeente: string;

}

interface Field {
  name: string;
  crop: string;
  acreage: string;


}

@Component({
  selector: 'app-dashboard-overheid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-overheid.component.html',
  styleUrls: ['./dashboard-overheid.component.css']
})
export class DashboardOverheidComponent implements OnInit {
  user: User | null = null;
  fields: Field[] = [];  // Store the list of fields


  constructor(
    private userService: UserService,
    private router: Router,
    private schadeclaimService: InsuranceFormService,
    private fieldService: FieldService
  ) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      // Check if `this.user` is not null
      this.user && this.getFields(this.user.id);  // Only call getFields if user is not null
    }
  }

  getFields(userId: number) {
    this.fieldService.getFieldsByGemeente(userId).subscribe(
      (fields) => {
        this.fields = fields; // Assuming the response is an array of fields
        console.log(this.fields)

      },
      (error) => {
        console.error('Error fetching fields:', error);
      }
    );
  }
}
