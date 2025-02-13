import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';

import { Injectable } from '@angular/core';
import { UserRoleResponseDto } from '../../dtos/UserRole/UserRole-response-dto';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UserRoleService {
  private apiUrl = `${environment.baseUrl}/userrole`;

  constructor(private http: HttpClient) {}

  getRolesByUserId(userId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`, {
      withCredentials: true,
    });
  }

  getUserRole(userid: number): Observable<UserRoleResponseDto> {
    return this.http.get<UserRoleResponseDto>(`${this.apiUrl}/${userid}/`, {
      withCredentials: true,
    });
  }

  getAllRoles(): Observable<UserRoleResponseDto[]> {
    return this.http.get<UserRoleResponseDto[]>(`${this.apiUrl}/all/`, {
      withCredentials: true,
    });
  }
}
