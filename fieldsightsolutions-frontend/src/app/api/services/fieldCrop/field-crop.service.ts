import { Injectable } from '@angular/core';
import { FieldCropResponseDto } from '../../dtos/FieldCrop/FieldCrop-response-dto';

@Injectable({
  providedIn: 'root'
})
export class FieldCropService {

  constructor() { }

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
      }
    ];

    return fieldCrops;
  }

  getFieldCropById(id: number): FieldCropResponseDto | null {
    const fieldCrops = this.getFieldCrops();
    const fieldCrop = fieldCrops.find(fc => fc.id === id);
    return fieldCrop ?? null;
  }

  getFieldCropsByFieldId(fieldId: number): FieldCropResponseDto[] {
    const fieldCrops = this.getFieldCrops();
    const filteredFieldCrops = fieldCrops.filter(fc => fc.fieldId === fieldId);
    return filteredFieldCrops;
  }

  getFieldCropsByCropId(cropId: number): FieldCropResponseDto[] {
    const fieldCrops = this.getFieldCrops();
    const filteredFieldCrops = fieldCrops.filter(fc => fc.cropId === cropId);
    return filteredFieldCrops;
  }
}
