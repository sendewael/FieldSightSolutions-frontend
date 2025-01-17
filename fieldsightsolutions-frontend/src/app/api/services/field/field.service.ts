import { Injectable } from '@angular/core';
import { FieldResponsetDto } from '../../dtos/Field/Field-response-dto';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FieldService {
  private apiUrl = `${environment.baseUrl}/fields`

  constructor(private http: HttpClient) {
  }

  getFields(): Observable<FieldResponsetDto[]> {
    return this.http.get<FieldResponsetDto[]>(`${this.apiUrl}/all`)
  }

  updateField(id: number, updatedField: Partial<FieldResponsetDto>): Observable<FieldResponsetDto> {
    return this.http.put<FieldResponsetDto>(`${this.apiUrl}/edit/${id}`, updatedField);
  }


  // Fetch fields based on userId
  getFieldsByUserId(userId: number): Observable<FieldResponsetDto[]> {
    return this.http.get<FieldResponsetDto[]>(`http://localhost:8000/api/fields/user/${userId}`, { withCredentials: true });
  }

  // Fetch fields based on userId
  getFieldById(selectedFieldId: number): Observable<FieldResponsetDto[]> {
    return this.http.get<FieldResponsetDto[]>(`http://localhost:8000/api/fields/${selectedFieldId}`, { withCredentials: true });
  }
}
