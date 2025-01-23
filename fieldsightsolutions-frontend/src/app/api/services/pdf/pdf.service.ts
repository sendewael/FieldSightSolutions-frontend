import { Injectable } from '@angular/core';
import { ImageResponseDto } from '../../dtos/Image/Image-response-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class PDFService {

  constructor(private httpClient: HttpClient) {
  }


  getPDF(insuranceId: number | undefined): Observable<Blob> {
    return this.httpClient.get<Blob>(`http://localhost:8000/api/generatepdf/${insuranceId}/`, { 
      withCredentials: true, 
      responseType: 'blob' as 'json' 
    });
}
}
