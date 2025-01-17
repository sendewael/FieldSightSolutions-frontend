import { Injectable } from '@angular/core';
import { InsuranceFormResponseDto } from '../../dtos/InsuranceForm/InsuranceForm-response-dto';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InsuranceFormService {

  private apiUrl = `${environment.baseUrl}/insurance-claims`

  constructor(private http: HttpClient) { }

  getInsuranceForms(): InsuranceFormResponseDto[] {
    let insuranceForms: InsuranceFormResponseDto[] = [
      {
        id: 1,
        damageId: 1,
        fieldId: 1,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        active: true
      },
      {
        id: 2,
        damageId: 2,
        fieldId: 2,
        startDate: new Date('2023-02-01'),
        endDate: new Date('2023-11-30'),
        active: false
      },
      {
        id: 3,
        damageId: 3,
        fieldId: 3,
        startDate: new Date('2023-03-01'),
        endDate: new Date('2023-12-31'),
        active: true
      }
    ];

    return insuranceForms;
  }

  getInsuranceFormById(id: number): InsuranceFormResponseDto | null {
    const insuranceForms = this.getInsuranceForms();
    const insuranceForm = insuranceForms.find(form => form.id === id);
    return insuranceForm ?? null;
  }

  getInsuranceFormsByDamageId(damageId: number): InsuranceFormResponseDto[] {
    const insuranceForms = this.getInsuranceForms();
    const forms = insuranceForms.filter(form => form.damageId === damageId);
    return forms;
  }

  getActiveInsuranceForms(): InsuranceFormResponseDto[] {
    const insuranceForms = this.getInsuranceForms();
    const activeForms = insuranceForms.filter(form => form.active);
    return activeForms;
  }

  getInsuranceclaimsByUserId(userId: number): Observable<InsuranceFormResponseDto[]> {
    return this.http.get<InsuranceFormResponseDto[]>(`${this.apiUrl}/${userId}`);
  }
}
