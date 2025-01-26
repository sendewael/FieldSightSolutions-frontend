import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Emitters } from '../../Auth/emitters/emitters';
import { UserService } from '../../api/services/user/user.service';
import { UserRoleService } from '../../api/services/userRole/user-role.service';
import { environment } from '../../../environments/environment.development'; // Import environment configuration

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

  editUser = { ...this.user };
  roleName = '';
  public isEdit: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private userroleService: UserRoleService
  ) { }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      this.router.navigate(['/login']);
      return; // Stop further execution if no user is found
    }

    this.userService.getUser().subscribe((data: any) => {
      this.user = data;
      this.editUser = { ...data };
      this.fetchUserRole(data.id);
    });
  }

  fetchUserRole(userId: number): void {
    this.userroleService.getRolesByUserId(userId).subscribe((response: any) => {
      this.roleName = response.role_name;
    });
  }

  toggleEdit(): void {
    if (this.isEdit) {
      this.editUser = { ...this.user };
    }
    this.isEdit = !this.isEdit;
  }

  save(): void {
    const saveUrl = `${environment.baseUrl}/users/update`; // Use dynamic baseUrl if needed

    // Save updated user data
    this.userService.updateUser(this.editUser)
      .subscribe({
        next: (user) => {
          alert('Account updated successfully!');
          Emitters.userEmitter.emit(user);
          localStorage.setItem('user', JSON.stringify(user));
          this.user = { ...this.editUser };
          this.isEdit = false;
          this.router.navigate(['/acount']);
        },
        error: (err) => {
          console.error('Failed to update account', err);
        }
      });
  }
}

