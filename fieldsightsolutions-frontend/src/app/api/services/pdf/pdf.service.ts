import { Injectable } from '@angular/core';
import { ImageResponseDto } from '../../dtos/Image/Image-response-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PDFService {

  private apiUrl = `${environment.baseUrl}/generatepdf`;
  private eoplazaApiUrl = `${environment.baseUrl}/generateEOplazapdf`;


  constructor(private httpClient: HttpClient) {
  }


  getPDF(insuranceId: number | undefined): Observable<Blob> {
    return this.httpClient.get<Blob>(`${this.apiUrl}/${insuranceId}/`, {
      withCredentials: true,
      responseType: 'blob' as 'json'
    });
  }

  getEOplazaPDF(insuranceId: number | undefined): Observable<Blob> {
    return this.httpClient.get<Blob>(`${this.eoplazaApiUrl}/${insuranceId}/`, {
      withCredentials: true,
      responseType: 'blob' as 'json'
    });
  }
}
