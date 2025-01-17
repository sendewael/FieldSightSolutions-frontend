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

  constructor(private http: HttpClient) { }

  getFields(): Observable<FieldResponsetDto[]> {
    return this.http.get<FieldResponsetDto[]>(`${this.apiUrl}/all`)
  }

  updateField(id: number, updatedField: Partial<FieldResponsetDto>): Observable<FieldResponsetDto> {
    return this.http.put<FieldResponsetDto>(`${this.apiUrl}/edit/${id}`, updatedField);
  }

}
