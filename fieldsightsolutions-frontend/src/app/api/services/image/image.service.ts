import { Injectable } from '@angular/core';
import { ImageResponseDto } from '../../dtos/Image/Image-response-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment.development';
import { EOPlazaImageResponseDto } from '../../dtos/EOplazaImage/eoplazaimage-response-dto';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private apiUrl = `${environment.baseUrl}/images`
  private eoplazaApiUrl = `${environment.baseUrl}/eoplazaimages`


  constructor(private httpClient: HttpClient) {
  }



  postImage(formdata: File): Observable<ImageResponseDto[]> {
    return this.httpClient.post<ImageResponseDto[]>(`${this.apiUrl}/`, formdata, { withCredentials: true });
  }

  getImages(insuranceId: number | undefined): Observable<ImageResponseDto[]> {
    return this.httpClient.get<ImageResponseDto[]>(`${this.apiUrl}/${insuranceId}/`, { withCredentials: true });
  }

  getEOplazaImages(insuranceId: number): Observable<EOPlazaImageResponseDto> {
    return this.httpClient.get<EOPlazaImageResponseDto>(`${this.eoplazaApiUrl}/${insuranceId}/`, { withCredentials: true });
  }
}

