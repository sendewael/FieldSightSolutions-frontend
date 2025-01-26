import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import { RequestedImageResponseDto } from '../../dtos/RequestedImages/Image-response-dto';
import { environment } from '../../../../environments/environment.development';
import { RequestedImageRequestDto } from '../../dtos/RequestedImages/Image-request-dto';

@Injectable({
  providedIn: 'root'
})
export class RequestedImageService {
  private apiUrl = `${environment.baseUrl}/requestedimages`;

  constructor(private httpClient: HttpClient) {
  }



  getImages(insuranceId: number | undefined): Observable<RequestedImageResponseDto[]> {
    return this.httpClient.get<RequestedImageResponseDto[]>(`${this.apiUrl}/${insuranceId}/`, { withCredentials: true });
  }

  addRequestImage(requestImage: RequestedImageRequestDto): Observable<RequestedImageRequestDto> {
    return this.httpClient.post<RequestedImageRequestDto>(`${this.apiUrl}/`, requestImage);
  }
}

