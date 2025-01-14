import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schadeclaims',
  templateUrl: './schadeclaims.component.html',
  styleUrls: ['./schadeclaims.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]  // Add CommonModule here
})
export class SchadeclaimsComponent implements OnInit {
  claims: any[] = [];  // Store the insurance claims
  userId: number | null = null;  // Store the user ID

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
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
    this.http.get(`http://localhost:8000/api/insurance-claims/${userId}/`, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.claims = response;  // Assign the response data to the claims array
        },
        error: (err) => {
          console.error('Failed to fetch insurance claims', err);
        }
      });
  }
}
