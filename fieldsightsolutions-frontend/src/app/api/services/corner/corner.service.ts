import { Injectable } from '@angular/core';
import { CornerResponseDto } from '../../dtos/Corner/Corner-response-dto';

@Injectable({
  providedIn: 'root'
})
export class CornerService {

  constructor() { }

  getCorners(): CornerResponseDto[] {
    // Corners logically distributed around Geel, Olen, and Mol (latitude and longitude)
    let corners: CornerResponseDto[] = [
      // Field 5: Geel Hoog
      {
        id: 17,
        fieldId: 5,
        index: 1,
        xCord: "51.1630",
        yCord: "4.9900"
      },
      {
        id: 18,
        fieldId: 5,
        index: 2,
        xCord: "51.1632",
        yCord: "4.9915"
      },
      {
        id: 19,
        fieldId: 5,
        index: 3,
        xCord: "51.1627",
        yCord: "4.9920"
      },
      {
        id: 20,
        fieldId: 5,
        index: 4,
        xCord: "51.1625",
        yCord: "4.9905"
      },

      // Field 6: Geel Hoog 2
      {
        id: 21,
        fieldId: 6,
        index: 1,
        xCord: "51.1635",
        yCord: "4.9920"
      },
      {
        id: 22,
        fieldId: 6,
        index: 2,
        xCord: "51.1637",
        yCord: "4.9935"
      },
      {
        id: 23,
        fieldId: 6,
        index: 3,
        xCord: "51.1632",
        yCord: "4.9940"
      },
      {
        id: 24,
        fieldId: 6,
        index: 4,
        xCord: "51.1630",
        yCord: "4.9925"
      },
      // Field 1: Geel
      {
        id: 1,
        fieldId: 1,
        index: 1,
        xCord: "51.1621",
        yCord: "4.9915"
      },
      {
        id: 2,
        fieldId: 1,
        index: 2,
        xCord: "51.1623",
        yCord: "4.9930"
      },
      {
        id: 3,
        fieldId: 1,
        index: 3,
        xCord: "51.1618",
        yCord: "4.9935"
      },
      {
        id: 4,
        fieldId: 1,
        index: 4,
        xCord: "51.1616",
        yCord: "4.9918"
      },

      // Field 2: Olen
      {
        id: 5,
        fieldId: 3,
        index: 1,
        xCord: "51.1450",
        yCord: "4.8830"
      },
      {
        id: 6,
        fieldId: 3,
        index: 2,
        xCord: "51.1453",
        yCord: "4.8845"
      },
      {
        id: 7,
        fieldId: 3,
        index: 3,
        xCord: "51.1448",
        yCord: "4.8850"
      },
      {
        id: 8,
        fieldId: 3,
        index: 4,
        xCord: "51.1446",
        yCord: "4.8835"
      },

      // Field 3: Mol
      {
        id: 9,
        fieldId: 4,
        index: 1,
        xCord: "51.1930",
        yCord: "5.1150"
      },
      {
        id: 10,
        fieldId: 4,
        index: 2,
        xCord: "51.1935",
        yCord: "5.1165"
      },
      {
        id: 11,
        fieldId: 4,
        index: 3,
        xCord: "51.1928",
        yCord: "5.1170"
      },
      {
        id: 12,
        fieldId: 4,
        index: 4,
        xCord: "51.1925",
        yCord: "5.1155"
      },
      {
        id: 13,
        fieldId: 2,
        index: 1,
        xCord: "51.1621",
        yCord: "4.9936" // Shifted east
      },
      {
        id: 14,
        fieldId: 2,
        index: 2,
        xCord: "51.1623",
        yCord: "4.9951" // Shifted east
      },
      {
        id: 15,
        fieldId: 2,
        index: 3,
        xCord: "51.1618",
        yCord: "4.9956" // Shifted east
      },
      {
        id: 16,
        fieldId: 2,
        index: 4,
        xCord: "51.1616",
        yCord: "4.9939" // Shifted east
      },
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
