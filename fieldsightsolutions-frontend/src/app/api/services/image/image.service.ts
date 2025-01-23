import { Injectable } from '@angular/core';
import { ImageResponseDto } from '../../dtos/Image/Image-response-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private apiUrl = `${environment.baseUrl}/images`


  constructor(private httpClient: HttpClient) {
  }



  postImage(formdata: File): Observable<ImageResponseDto[]> {
    return this.httpClient.post<ImageResponseDto[]>(`${this.apiUrl}/`, formdata, { withCredentials: true });
  }

  getImages(insuranceId: number | undefined): Observable<ImageResponseDto[]> {
    return this.httpClient.get<ImageResponseDto[]>(`${this.apiUrl}/${insuranceId}/`, { withCredentials: true });
  }
}

