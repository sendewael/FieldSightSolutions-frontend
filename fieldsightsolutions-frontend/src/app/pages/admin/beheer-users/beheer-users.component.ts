import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from '../../../api/services/user/user.service';
import { UserResponseDto } from '../../../api/dtos/User/User-response-dto';
import { map, Observable, forkJoin } from 'rxjs';
import { UserRoleService } from '../../../api/services/userRole/user-role.service';
import { UserRoleResponseDto } from '../../../api/dtos/UserRole/UserRole-response-dto';

@Component({
  selector: 'app-beheer-users',
  templateUrl: './beheer-users.component.html',
  styleUrls: ['./beheer-users.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
})
export class BeheerUsersComponent implements OnInit {
  users: UserResponseDto[] = [];
  filteredUsers: any[] = [];
  filter = {
    name: '',
    role: '',
    active: '',
  };
  page: number = 1;
  users$!: Observable<UserResponseDto[]>;
  userRoles$!: Observable<UserRoleResponseDto[]>;
  userRoles: UserRoleResponseDto[] = [];

  constructor(
    private userService: UserService,
    private userRoleService: UserRoleService
  ) {}

  ngOnInit(): void {
    this.userService.fetchUsers();
    this.users$ = this.userService.users$.pipe(
      map((users) =>
        users.map((user) => {
          this.userRoleService.getUserRole(user.id).subscribe({
            next: (role) => {
              console.log(role.name);
              user.role_name = role.name;
            },
            error: (err) => {
              console.error('Rol ophalen mislukt:', err);
            },
          });
          return user;
        })
      )
    );
    this.userRoleService.getAllRoles().subscribe((roles) => {
      this.userRoles = roles;
      console.log(this.userRoles);
    });
  }
  editUser(user: any): void {
    user.isEditing = true;
  }

  saveUser(user: UserResponseDto): void {
    const updatedUser = { ...user };
    delete updatedUser.isEditing;
    delete updatedUser.role_name;

    this.userService.updateUser(updatedUser).subscribe({
      next: (updatedUsers) => {
        user.isEditing = false;
        console.log('Gebruiker succesvol geüpdatet', updatedUsers);
      },
      error: (err) => {
        console.error('Fout bij opslaan:', err);
      },
    });
  }

  cancelEdit(user: UserResponseDto): void {
    user.isEditing = false;
  }

  deleteUser(user: any): void {
    // Voeg hier de logica toe om een gebruiker te verwijderen
  }

  toggleActiveFilter(): void {
    this.filter.active = this.filter.active ? '' : 'true';
  }

  getRoleNameById(roleId: number): string {
    let roleName = '';
    this.userRoles$.subscribe((roles) => {
      const role = roles.find((r) => r.id === roleId);
      if (role) {
        roleName = role.name;
      }
    });
    return roleName;
  }
}
