import { Injectable } from '@angular/core';
import { CornerResponseDto } from '../../dtos/Corner/Corner-response-dto';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CornerRequestDto } from '../../dtos/Corner/Corner-request-dto';

@Injectable({
  providedIn: 'root'
})
export class CornerService {
  private apiUrl = `${environment.baseUrl}/corners`

  constructor(private http: HttpClient) { }

  getCornersByFieldId(fieldId: number): Observable<CornerResponseDto[]> {
    const url = `${this.apiUrl}/${fieldId}`;
    return this.http.get<CornerResponseDto[]>(url);
  }

  createCorner(newCorner: CornerRequestDto[]): Observable<CornerResponseDto> {
    return this.http.post<CornerResponseDto>(`${this.apiUrl}/`, newCorner);
  }

}
