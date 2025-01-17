import { Injectable } from '@angular/core';
import { InsuranceFormResponseDto } from '../../dtos/InsuranceForm/InsuranceForm-response-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class InsuranceFormService {

  constructor(private httpClient: HttpClient) {
  }

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


  getInsuranceformByClaimId(claimId: number): Observable<InsuranceFormResponseDto[]> {
    return this.httpClient.get<InsuranceFormResponseDto[]>(`http://localhost:8000/api/insurance-claims/id/${claimId}/`, { withCredentials: true });
  }

  getInsuranceformByUserId(userId: number): Observable<InsuranceFormResponseDto[]> {
    return this.httpClient.get<InsuranceFormResponseDto[]>(`http://localhost:8000/api/insurance-claims/${userId}`, { withCredentials: true });
  }

  postInsuranceformById(userId: number | undefined, formdata: object): Observable<InsuranceFormResponseDto[]> {
    return this.httpClient.post<InsuranceFormResponseDto[]>(`http://localhost:8000/api/insurance-claims/${userId}`, formdata, { withCredentials: true });
  }
}
