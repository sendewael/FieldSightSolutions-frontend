import { Injectable } from '@angular/core';
import { FieldCropResponseDto } from '../../dtos/FieldCrop/FieldCrop-response-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class FieldCropService {
  private apiUrl = `${environment.baseUrl}/fieldCrop`

  constructor(private http: HttpClient) { }

  getFieldCropsByFieldId(fieldId: number): Observable<FieldCropResponseDto[]> {
    return this.http.get<FieldCropResponseDto[]>(`${this.apiUrl}/${fieldId}`, { withCredentials: true });
  }

  updateFieldCrop(fieldCropId: number, cropId: number): Observable<FieldCropResponseDto> {
    return this.http.put<FieldCropResponseDto>(`${this.apiUrl}/edit/${fieldCropId}`, { cropId });
  }
}
