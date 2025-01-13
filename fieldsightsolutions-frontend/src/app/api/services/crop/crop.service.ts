import { Injectable } from '@angular/core';
import { CropResponseDto } from '../../dtos/Crop/Crop-response-dto';

@Injectable({
  providedIn: 'root'
})
export class CropService {

  constructor() { }

  getCrops(): CropResponseDto[] {
    let crops: CropResponseDto[] = [
      {
        id: 1,
        name: "Wheat"
      },
      {
        id: 2,
        name: "Corn"
      },
      {
        id: 3,
        name: "Rice"
      }
    ];

    return crops;
  }

  getCropById(id: number): CropResponseDto | null {
    const crops = this.getCrops();
    const crop = crops.find(c => c.id === id);
    return crop ?? null;
  }

  getCropByName(name: string): CropResponseDto | null {
    const crops = this.getCrops();
    const crop = crops.find(c => c.name.toLowerCase() === name.toLowerCase());
    return crop ?? null;
  }
}
