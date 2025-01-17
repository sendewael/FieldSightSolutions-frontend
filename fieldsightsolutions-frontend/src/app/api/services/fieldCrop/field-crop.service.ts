import { Injectable } from '@angular/core';
import { FieldCropResponseDto } from '../../dtos/FieldCrop/FieldCrop-response-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class FieldCropService {


  constructor(private httpClient: HttpClient) {
  }


  getFieldCrops(): FieldCropResponseDto[] {
    let fieldCrops: FieldCropResponseDto[] = [
      {
        id: 1,
        fieldId: 1,
        cropId: 1
      },
      {
        id: 2,
        fieldId: 2,
        cropId: 2
      },
      {
        id: 3,
        fieldId: 3,
        cropId: 3
      },
      {
        id: 4,
        fieldId: 4,
        cropId: 2
      },
      {
        id: 5,
        fieldId: 5,
        cropId: 2
      },
      {
        id: 6,
        fieldId: 6,
        cropId: 2
      },
    ];

    return fieldCrops;
  }

  getFieldCropById(id: number): FieldCropResponseDto | null {
    const fieldCrops = this.getFieldCrops();
    const fieldCrop = fieldCrops.find(fc => fc.id === id);
    return fieldCrop ?? null;
  }



  getFieldCropsByCropId(cropId: number): FieldCropResponseDto[] {
    const fieldCrops = this.getFieldCrops();
    const filteredFieldCrops = fieldCrops.filter(fc => fc.cropId === cropId);
    return filteredFieldCrops;
  }

  getFieldCropsByFieldId(fieldId: number): Observable<FieldCropResponseDto[]> {
      return this.httpClient.get<FieldCropResponseDto[]>(`http://localhost:8000/api/fieldCrop/${fieldId}`, { withCredentials: true });
    }
}
