import { Injectable } from '@angular/core';
import { CropResponseDto } from '../../dtos/Crop/Crop-response-dto';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CropService {
  private apiUrl = `${environment.baseUrl}/fields`

  constructor(private http: HttpClient) { }

}
