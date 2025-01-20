import { Injectable } from '@angular/core';
import { ImageResponseDto } from '../../dtos/Image/Image-response-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private httpClient: HttpClient) {
  }



  postImage(formdata: File): Observable<ImageResponseDto[]> {
    return this.httpClient.post<ImageResponseDto[]>(`http://localhost:8000/api/images/`, formdata, { withCredentials: true });
  }

  getImages(insuranceId:number | undefined): Observable<ImageResponseDto[]> {
    return this.httpClient.get<ImageResponseDto[]>(`http://localhost:8000/api/images/${insuranceId}/`, { withCredentials: true });
  }
}

