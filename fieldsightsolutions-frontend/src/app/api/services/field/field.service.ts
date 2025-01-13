import { Injectable } from '@angular/core';
import { FieldResponsetDto } from '../../dtos/Field/Field-response-dto';

@Injectable({
  providedIn: 'root'
})
export class FieldService {

  constructor() { }

  getFields(): FieldResponsetDto[] {
    let fields: FieldResponsetDto[] = [
      {
        id: 1,
        name: "Field A",
        acreage: "100 acres",
        municipality: "Municipality A",
        postalcode: "12345"
      },
      {
        id: 2,
        name: "Field B",
        acreage: "200 acres",
        municipality: "Municipality B",
        postalcode: "23456"
      },
      {
        id: 3,
        name: "Field C",
        acreage: "150 acres",
        municipality: "Municipality C",
        postalcode: "34567"
      }
    ];

    return fields;
  }

  getFieldById(id: number): FieldResponsetDto | null {
    const fields = this.getFields();
    const field = fields.find(f => f.id === id);
    return field ?? null;
  }

  getFieldsByMunicipality(municipality: string): FieldResponsetDto[] {
    const fields = this.getFields();
    return fields.filter(f => f.municipality.toLowerCase() === municipality.toLowerCase());
  }

  getFieldsByPostalCode(postalCode: string): FieldResponsetDto[] {
    const fields = this.getFields();
    return fields.filter(f => f.postalcode === postalCode);
  }
}
