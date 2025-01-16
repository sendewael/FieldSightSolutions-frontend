import { Injectable } from '@angular/core';
import { UserFieldResponseDto } from '../../dtos/UserField/UserField-response-dto';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { UserFieldRequestDto } from '../../dtos/UserField/UserField-request-dto';

@Injectable({
  providedIn: 'root'
})
export class UserFieldService {
  private apiUrl = `${environment.baseUrl}/userField`

  constructor(private http: HttpClient) { }

  getUserFields(): Observable<UserFieldResponseDto[]> {
    return this.http.get<UserFieldResponseDto[]>(`${this.apiUrl}/all`)
  }

  getUserFieldsByUserId(userId: number): Observable<UserFieldResponseDto[]> {
    const url = `${this.apiUrl}/userId/${userId}`;
    return this.http.get<UserFieldResponseDto[]>(url);
  }

  addUserField(userFieldRequest: UserFieldRequestDto): Observable<UserFieldResponseDto> {
    return this.http.post<UserFieldResponseDto>(`${this.apiUrl}/`, userFieldRequest);
  }

  getUserFieldByFieldId(fieldId: number): Observable<UserFieldResponseDto[]> {
    const url = `${this.apiUrl}/fieldId/${fieldId}`;
    return this.http.get<UserFieldResponseDto[]>(url);
  }

  deleteUserField(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`)
  }
}
