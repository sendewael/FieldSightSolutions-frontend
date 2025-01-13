import { Injectable } from '@angular/core';
import { CornerResponseDto } from '../../dtos/Corner/Corner-response-dto';

@Injectable({
  providedIn: 'root'
})
export class CornerService {

  constructor() { }

  getCorners(): CornerResponseDto[] {
    let corners: CornerResponseDto[] = [
      {
        id: 1,
        fieldId: 1,
        index: 1,
        xCord: "34.0522",
        yCord: "118.2437"
      },
      {
        id: 2,
        fieldId: 1,
        index: 2,
        xCord: "34.0523",
        yCord: "118.2438"
      },
      {
        id: 3,
        fieldId: 1,
        index: 3,
        xCord: "34.0524",
        yCord: "118.2439"
      },
      {
        id: 4,
        fieldId: 1,
        index: 4,
        xCord: "34.0525",
        yCord: "118.2440"
      },

      {
        id: 5,
        fieldId: 2,
        index: 1,
        xCord: "40.7128",
        yCord: "74.0060"
      },
      {
        id: 6,
        fieldId: 2,
        index: 2,
        xCord: "40.7129",
        yCord: "74.0061"
      },
      {
        id: 7,
        fieldId: 2,
        index: 3,
        xCord: "40.7130",
        yCord: "74.0062"
      },
      {
        id: 8,
        fieldId: 2,
        index: 4,
        xCord: "40.7131",
        yCord: "74.0063"
      },

      {
        id: 9,
        fieldId: 3,
        index: 1,
        xCord: "51.5074",
        yCord: "0.1278"
      },
      {
        id: 10,
        fieldId: 3,
        index: 2,
        xCord: "51.5075",
        yCord: "0.1280"
      },
      {
        id: 11,
        fieldId: 3,
        index: 3,
        xCord: "51.5076",
        yCord: "0.1282"
      },
      {
        id: 12,
        fieldId: 3,
        index: 4,
        xCord: "51.5077",
        yCord: "0.1284"
      }
    ];

    return corners;
  }

  getCornerById(id: number): CornerResponseDto | null {
    const corners = this.getCorners();
    const corner = corners.find(c => c.id === id);
    return corner ?? null;
  }

  getCornersByFieldId(fieldId: number): CornerResponseDto[] {
    const corners = this.getCorners();
    return corners.filter(c => c.fieldId === fieldId);
  }
}
