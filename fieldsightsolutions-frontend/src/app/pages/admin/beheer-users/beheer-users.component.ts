import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from '../../../api/services/user/user.service';
import { UserCrudDto } from '../../../api/dtos/User/user-crud-dto';
import { map, Observable } from 'rxjs';
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
  users: UserCrudDto[] = [];
  filter = {
    name: '',
    role: '',
    active: '',
  };
  page: number = 1;
  users$!: Observable<UserCrudDto[]>;
  userRoles: UserRoleResponseDto[] = [];
  confirmModal: boolean = false;
  selectedUser?: UserCrudDto;

  constructor(
    private userService: UserService,
    private userRoleService: UserRoleService
  ) {}

  ngOnInit(): void {
    this.userService.fetchUsers();
    this.users$ = this.userService.users$.pipe(
      map((users) => {
        return users
          .map((user) => ({
            ...user,
            role_name: user.role?.name || 'Onbekend', // Haalt rolnaam direct uit de API-response
          }))
          .sort((a, b) => {
            // Eerst sorteren op role_id
            if (a.userRole_id !== b.userRole_id) {
              return a.userRole_id - b.userRole_id; // Oplopend sorteren op userRole_id
            }
            // Als role_id gelijk is, sorteren op alfabetische volgorde (bijvoorbeeld voornaam)
            return a.firstName.localeCompare(b.firstName); // Oplopend sorteren op voornaam
          });
      })
    );

    // Haal alle rollen op voor dropdowns
    this.userRoleService.getAllRoles().subscribe((roles) => {
      this.userRoles = roles;
    });
  }

  // Methode om gebruikers te filteren
  filterUsers(): void {
    // Fetch de gefilterde gebruikers op basis van de filters
    this.users$ = this.userService.users$.pipe(
      map((users) => {
        return users
          .filter((user) => {
            // Filter op naam als filter.name niet leeg is
            const matchesName =
              user.firstName
                .toLowerCase()
                .includes(this.filter.name.toLowerCase()) ||
              user.lastName
                .toLowerCase()
                .includes(this.filter.name.toLowerCase());
            // Filter op rol als filter.role niet leeg is
            const matchesRole = this.filter.role
              ? user.userRole_id === +this.filter.role
              : true;
            // Filter op actieve status
            const matchesActive = this.filter.active
              ? user.is_active === (this.filter.active === 'true')
              : true;

            return matchesName && matchesRole && matchesActive;
          })
          .map((user) => ({
            ...user,
            role_name: user.role?.name || 'Onbekend', // Haalt rolnaam direct uit de API-response
          }))
          .sort((a, b) => {
            // Eerst sorteren op role_id
            if (a.userRole_id !== b.userRole_id) {
              return a.userRole_id - b.userRole_id; // Oplopend sorteren op userRole_id
            }
            // Als role_id gelijk is, sorteren op alfabetische volgorde (bijvoorbeeld voornaam)
            return a.firstName.localeCompare(b.firstName); // Oplopend sorteren op voornaam
          });
      })
    );
  }

  editUser(user: UserCrudDto): void {
    user.isEditing = true;
  }

  saveUser(user: UserCrudDto): void {
    const updatedUser = { ...user };
    console.log(updatedUser);
    delete updatedUser.isEditing;
    delete updatedUser.role;
    updatedUser.userRole_id = user.userRole_id as number;

    console.log(updatedUser);

    // Update de gebruiker via de service
    this.userService.updateUserCrud(updatedUser, user.id).subscribe({
      next: (updatedUser) => {
        user.isEditing = false;
        console.log('Gebruiker succesvol geüpdatet', updatedUser);

        // Herlaad de lijst van gebruikers na de succesvolle update
        this.userService.fetchUsers();
      },
      error: (err) => {
        console.error('Fout bij opslaan:', err);
      },
    });
  }

  cancelEdit(user: UserCrudDto): void {
    user.isEditing = false;
  }

  deleteUser(user: UserCrudDto): void {
    this.confirmModal = true;
    this.selectedUser = user;

    console.log(this.selectedUser);
  }

  confirmDelete(): void {
    if (!this.selectedUser) {
      return;
    }

    this.userService.deleteUser(this.selectedUser.id).subscribe(
      () => {
        console.log('User deleted successfully');
        this.userService.fetchUsers();
        this.confirmModal = false;
      },
      (error) => {
        console.error('Error deleting user:', error);
      }
    );
  }

  cancelDelete(): void {
    this.confirmModal = false;
    this.selectedUser = undefined;
  }

  toggleActiveFilter(): void {
    this.filter.active = this.filter.active ? '' : 'true';
  }
}
