import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserResponseDto } from '../../dtos/User/User-response-dto';
import { environment } from '../../../../environments/environment.development';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.baseUrl}/user`;
  private userRoleSubject = new BehaviorSubject<number>(0);
  public userRole$ = this.userRoleSubject.asObservable();
  private userSubject = new BehaviorSubject<UserResponseDto[]>([]);
  public users$: Observable<UserResponseDto[]> =
    this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchUsers(): void {
    this.http
      .get<UserResponseDto[]>(`${this.apiUrl}/all`)
      .subscribe((users) => {
        this.userSubject.next(users);
      });
  }

  getAllUsers(): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(`${this.apiUrl}/all`);
  }

  getUserById(userId: number): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.apiUrl}/${userId}/`);
  }

  getUsersByRoleIds(roleIds: number[]): Observable<UserResponseDto[]> {
    return this.http.post<UserResponseDto[]>(`${this.apiUrl}/roles/`, roleIds);
  }

  getUser(): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(`${this.apiUrl}`, {
      withCredentials: true,
    });
  }

  updateUser(user: object): Observable<UserResponseDto[]> {
    return this.http.put<UserResponseDto[]>(`${this.apiUrl}`, user, {
      withCredentials: true,
    });
  }

  getUsersByAccessToUserField(pk: number): Observable<UserResponseDto[]> {
    return this.http.get<UserResponseDto[]>(`${this.apiUrl}/access-field/`, {
      params: { userId: pk.toString() },
    });
  }
}
