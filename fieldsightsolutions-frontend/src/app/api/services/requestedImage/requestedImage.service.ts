import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import { RequestedImageResponseDto } from '../../dtos/RequestedImages/Image-response-dto';

@Injectable({
  providedIn: 'root'
})
export class RequestedImageService {

  constructor(private httpClient: HttpClient) {
  }



  // postImage(formdata: File): Observable<RequestedImageResponseDto[]> {
  //   return this.httpClient.post<RequestedImageResponseDto[]>(`http://localhost:8000/api/images/`, formdata, { withCredentials: true });
  // }

  getImages(insuranceId:number | undefined): Observable<RequestedImageResponseDto[]> {
    return this.httpClient.get<RequestedImageResponseDto[]>(`http://localhost:8000/api/requestedimages/${insuranceId}/`, { withCredentials: true });
  }
}

