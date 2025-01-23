import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Emitters } from '../../Auth/emitters/emitters';
import { UserService } from '../../api/services/user/user.service';
import { UserRoleService } from '../../api/services/userRole/user-role.service';
@Component({
  selector: 'app-acount',
  templateUrl: './acount.component.html',
  styleUrls: ['./acount.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true,


})
export class AcountComponent implements OnInit {
  user = {
    firstName: '',
    lastName: '',
    adres: '',
    gemeente: '',
    email: ''
  };
  roleName = ''; // Variable to hold the role name

  constructor(private http: HttpClient, private router: Router, private userService: UserService, private userroleService : UserRoleService) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      this.router.navigate(['/login']);
    }

    // Fetch user data on initialization
    this.userService.getUser()
      .subscribe((data: any) => {
        this.user = data;

        // After fetching user data, fetch the role based on the user ID
        this.fetchUserRole(data.id);
      });
  }

  fetchUserRole(userId: number): void {
    // Make the API call to get the user role using the user's ID
    this.userroleService.getRolesByUserId(userId)
      .subscribe((response: any) => {
        this.roleName = response.role_name; // Store the role name
      });
  }

  save(): void {
    // Save updated user data
    this.userService.updateUser(this.user)
      .subscribe({
        next: (user) => {
          alert('Account updated successfully!');
          Emitters.userEmitter.emit(user);
          localStorage.setItem('user', JSON.stringify(user));
          this.router.navigate(['/acount']);
        },
        error: (err) => {
          console.error('Failed to update account', err);
        }
      });
  }

}
