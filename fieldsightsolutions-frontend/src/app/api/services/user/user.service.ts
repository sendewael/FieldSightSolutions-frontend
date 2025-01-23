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

  constructor(private http: HttpClient) {
  }

  getAllUsers(): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(`${this.apiUrl}/all`)
  }

  getUserById(userId: number): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.apiUrl}/${userId}/`)
  }

  getUsersByRoleIds(roleIds: number[]): Observable<UserResponseDto[]> {
    return this.http.post<UserResponseDto[]>(`${this.apiUrl}/roles/`, roleIds);
  }

  // Fetch fields based on userId
  getUser(): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(`http://localhost:8000/api/user`, { withCredentials: true });
  }

  getUsersByAccessToUserField(pk: number): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(`${this.apiUrl}/access-field/`, { params: { userId: pk.toString() } });
  }
  
  
  
  
}
