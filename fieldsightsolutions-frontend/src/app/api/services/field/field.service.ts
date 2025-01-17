import { Injectable } from '@angular/core';
import { FieldResponsetDto } from '../../dtos/Field/Field-response-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'


@Injectable({
  providedIn: 'root'
})
export class FieldService {

  constructor(private httpClient: HttpClient) {
  }

  getFields(): FieldResponsetDto[] {
    let fields: FieldResponsetDto[] = [
      {
        id: 5,
        name: "Veld Geel Hoog",
        acreage: "90 acres",
        municipality: "Geel",
        postalcode: "2440"
      },
      {
        id: 6,
        name: "Veld Geel Hoog 2",
        acreage: "85 acres",
        municipality: "Geel",
        postalcode: "2440"
      },
      {
        id: 1,
        name: "Veld Geel Markt",
        acreage: "100 acres",
        municipality: "Geel",
        postalcode: "2440"
      },
      {
        id: 2,
        name: "Veld Geel Markt 2",
        acreage: "100 acres",
        municipality: "Geel",
        postalcode: "2440"
      },
      {
        id: 3,
        name: "Veld Olen",
        acreage: "200 acres",
        municipality: "Olen",
        postalcode: "2440"
      },
      {
        id: 4,
        name: "Veld Mol",
        acreage: "150 acres",
        municipality: "Mol",
        postalcode: "2450"
      }
    ];

    return fields;
  }

  getFieldsByMunicipality(municipality: string): FieldResponsetDto[] {
    const fields = this.getFields();
    return fields.filter(f => f.municipality.toLowerCase() === municipality.toLowerCase());
  }

  getFieldsByPostalCode(postalCode: string): FieldResponsetDto[] {
    const fields = this.getFields();
    return fields.filter(f => f.postalcode === postalCode);
  }

  updateField(id: number, updatedField: Partial<FieldResponsetDto>): boolean {
    const fields = this.getFields();
    const fieldIndex = fields.findIndex(f => f.id === id);

    if (fieldIndex === -1) {
      return false;
    }

    fields[fieldIndex] = { ...fields[fieldIndex], ...updatedField };
    return true;
  }

  // Fetch fields based on userId
  getFieldsByUserId(userId: number): Observable<FieldResponsetDto[]> {
    return this.httpClient.get<FieldResponsetDto[]>(`http://localhost:8000/api/fields/user/${userId}`, { withCredentials: true });
  }

  // Fetch fields based on userId
  getFieldById(selectedFieldId: number): Observable<FieldResponsetDto[]> {
    return this.httpClient.get<FieldResponsetDto[]>(`http://localhost:8000/api/fields/${selectedFieldId}`, { withCredentials: true });
  }
}
