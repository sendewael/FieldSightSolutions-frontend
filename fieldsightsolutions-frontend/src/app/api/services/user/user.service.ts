import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserCrudDto } from '../../dtos/User/user-crud-dto';
import { environment } from '../../../../environments/environment.development';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.baseUrl}/user`;
  private userRoleSubject = new BehaviorSubject<number>(0);
  public userRole$ = this.userRoleSubject.asObservable();
  private userSubject = new BehaviorSubject<UserCrudDto[]>([]);
  public users$: Observable<UserCrudDto[]> = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchUsers(): void {
    this.http
      .get<UserCrudDto[]>(`${this.apiUrl}/all/withRole/`, {
        withCredentials: true,
      })
      .subscribe(
        (users) => {
          this.userSubject.next(users);
        },
        (error) => {
          console.error('Fout bij ophalen van gebruikers:', error);
        }
      );
  }

  getAllUsers(): Observable<UserCrudDto[]> {
    return this.http.get<UserCrudDto[]>(`${this.apiUrl}/all`);
  }

  getAllUsersWithRole(): Observable<UserCrudDto[]> {
    return this.http.get<UserCrudDto[]>(`${this.apiUrl}/all/withRole/`, {
      withCredentials: true,
    });
  }

  getUserById(userId: number): Observable<UserCrudDto> {
    return this.http.get<UserCrudDto>(`${this.apiUrl}/${userId}/`, {
      withCredentials: true,
    });
  }

  getUsersByRoleIds(roleIds: number[]): Observable<UserCrudDto[]> {
    return this.http.post<UserCrudDto[]>(`${this.apiUrl}/roles/`, roleIds);
  }

  getUser(): Observable<UserCrudDto[]> {
    return this.http.get<UserCrudDto[]>(`${this.apiUrl}`, {
      withCredentials: true,
    });
  }

  updateUser(user: object): Observable<UserCrudDto[]> {
    return this.http.put<UserCrudDto[]>(`${this.apiUrl}`, user, {
      withCredentials: true,
    });
  }

  updateUserCrud(user: any, userID: number): Observable<UserCrudDto> {
    console.log(`update user: ${JSON.stringify(user)}`);
    return this.http.put<UserCrudDto>(`${this.apiUrl}/update/${userID}`, user, {
      withCredentials: true,
    });
  }

  getUsersByAccessToUserField(pk: number): Observable<UserCrudDto[]> {
    return this.http.get<UserCrudDto[]>(`${this.apiUrl}/access-field/`, {
      params: { userId: pk.toString() },
    });
  }

  deleteUser(userId: number): Observable<UserCrudDto> {
    return this.http.delete<UserCrudDto>(`${this.apiUrl}/delete/${userId}`, {
      withCredentials: true,
    });
  }
}
