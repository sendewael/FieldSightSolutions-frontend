import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserResponseDto } from '../../dtos/User/User-response-dto';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.baseUrl}/user`

  constructor(private http: HttpClient) { }

  // getUsers(): UserResponseDto[] {
  //   let users: UserResponseDto[] = [
  //     {
  //       id: 1,
  //       userRoleId: 1,
  //       firstName: "John",
  //       lastName: "Doe",
  //       email: "john.doe@example.com",
  //       password: "password123"
  //     },
  //     {
  //       id: 2,
  //       userRoleId: 2,
  //       firstName: "Jane",
  //       lastName: "Smith",
  //       email: "jane.smith@example.com",
  //       password: "securepass"
  //     },
  //     {
  //       id: 3,
  //       userRoleId: 3,
  //       firstName: "Alice",
  //       lastName: "Johnson",
  //       email: "alice.johnson@example.com",
  //       password: "mypassword"
  //     }
  //   ];

  //   return users;
  // }

  // getUserById(id: number): UserResponseDto | null {
  //   const users = this.getUsers();
  //   const user = users.find(u => u.id === id);
  //   return user ?? null;
  // }

  getAllUsers(): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(`${this.apiUrl}/all`)
  }
}
