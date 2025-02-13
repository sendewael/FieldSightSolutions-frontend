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
    return this.http.get<UserFieldResponseDto[]>(`${this.apiUrl}/userId/${userId}`);
  }

  getUserFieldByFieldId(fieldId: number): Observable<UserFieldResponseDto[]> {
    return this.http.get<UserFieldResponseDto[]>(`${this.apiUrl}/fieldId/${fieldId}`);
  }

  getUserFieldsByEmail(email: string): Observable<UserFieldResponseDto[]> {
    return this.http.get<UserFieldResponseDto[]>(`${this.apiUrl}/granted-email/${email}`)
  }

  getUserFieldsByMunicipality(municipality: string): Observable<UserFieldResponseDto[]> {
    return this.http.get<UserFieldResponseDto[]>(`${this.apiUrl}/by-municipality/${municipality}`)
  }

  addUserField(userFieldRequest: UserFieldRequestDto): Observable<UserFieldResponseDto> {
    return this.http.post<UserFieldResponseDto>(`${this.apiUrl}/`, userFieldRequest);
  }

  updateUserField(id: number, updatedField: Partial<UserFieldResponseDto>): Observable<UserFieldResponseDto> {
    return this.http.put<UserFieldResponseDto>(`${this.apiUrl}/edit/${id}`, updatedField);
  }

  deleteUserField(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`)
  }
}
