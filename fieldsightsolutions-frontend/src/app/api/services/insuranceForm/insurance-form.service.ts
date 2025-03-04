import { Injectable } from '@angular/core';
import { InsuranceFormResponseDto } from '../../dtos/InsuranceForm/InsuranceForm-response-dto';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class InsuranceFormService {


  private apiUrl = `${environment.baseUrl}/insurance-claims`;

  constructor(private http: HttpClient) { }



  getInsuranceformByClaimId(claimId: number): Observable<InsuranceFormResponseDto[]> {
    return this.http.get<InsuranceFormResponseDto[]>(`${this.apiUrl}/id/${claimId}/`, { withCredentials: true });
  }

  getInsuranceformByUserId(userId: number): Observable<InsuranceFormResponseDto[]> {
    return this.http.get<InsuranceFormResponseDto[]>(`${this.apiUrl}/${userId}`, { withCredentials: true });
  }

  getInsuranceClaimsByFieldId(fieldId: number): Observable<InsuranceFormResponseDto[]> {
    return this.http.get<InsuranceFormResponseDto[]>(`${this.apiUrl}/field/${fieldId}`, { withCredentials: true });
  }

  postInsuranceformById(userId: number | undefined, formdata: object): Observable<InsuranceFormResponseDto[]> {
    return this.http.post<InsuranceFormResponseDto[]>(`${this.apiUrl}/${userId}`, formdata, { withCredentials: true });
  }

  putInsuranceform(formId: number | undefined, formdata: object): Observable<InsuranceFormResponseDto[]> {
    return this.http.put<InsuranceFormResponseDto[]>(`${this.apiUrl}/edit/${formId}`, formdata, { withCredentials: true });

  }
  getInsuranceclaimsByUserId(userId: number): Observable<InsuranceFormResponseDto[]> {
    return this.http.get<InsuranceFormResponseDto[]>(`${this.apiUrl}/${userId}`);
  }

  getInsuranceClaimsByFieldAndStatus(field_id: number, status: number): Observable<InsuranceFormResponseDto[]> {
    return this.http.get<InsuranceFormResponseDto[]>(`${this.apiUrl}/field/${field_id}/status/${status}`);
  }

  putInsuranceformById(insuranceformId: number, formdata: InsuranceFormResponseDto): Observable<InsuranceFormResponseDto> {
    return this.http.put<InsuranceFormResponseDto>(`${this.apiUrl}/edit/${insuranceformId}`, formdata);
  }

  getInsuranceformsByUserIdByAccessToUserField(
    loggedInUserId: number,
    targetUserId: number
  ): Observable<InsuranceFormResponseDto[]> {
    return this.http.get<InsuranceFormResponseDto[]>(
      `${this.apiUrl}/access-field/userId/${targetUserId}`,
      {
        params: {
          loggedInUserId: loggedInUserId.toString(),
        },
      }
    );
  }


}
