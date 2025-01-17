import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InsuranceFormService } from '../../../api/services/insuranceForm/insurance-form.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../api/services/user/user.service';
import { UserResponseDto } from '../../../api/dtos/User/User-response-dto';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-schadeclaims-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schadeclaims-user.component.html',
  styleUrl: './schadeclaims-user.component.css'
})
export class SchadeclaimsUserComponent implements OnInit{
  schadeclaims: any[] = [];
  userList$!: Observable<UserResponseDto[]>;
  user: UserResponseDto | undefined;

  constructor(
    private route: ActivatedRoute,
    private schadeclaimService: InsuranceFormService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Haal de userId op via query parameters
    this.route.queryParams.subscribe((params) => {
      const userId = params['userId'];
  
      if (userId) {
        // Haal de schadeclaims op
        this.schadeclaimService.getInsuranceclaimsByUserId(userId).subscribe(
          (data) => {
            this.schadeclaims = data;
          },
          (error) => {
            console.error('Error fetching schadeclaims:', error);
          }
        );
  
        // Haal alle gebruikers op en filter op userId
        this.userService.getAllUsers()
          .pipe(
            map(users => users.find(user => user.id === parseInt(userId, 10)))
          )
          .subscribe(
            (filteredUser) => {
              this.user = filteredUser;
            },
            (error) => {
              console.error('Error fetching users:', error);
            }
          );
      }
    });
  }
  
  
  editClaim(claimId: number): void {
    // Navigate to the edit claim page, passing the claim ID in the route
    this.router.navigate(['/edit-schadeclaim', claimId]);
}

}
