import { Injectable } from '@angular/core';
import { UserFieldResponseDto } from '../../dtos/UserField/UserField-response-dto';

@Injectable({
  providedIn: 'root'
})
export class UserFieldService {

  constructor() { }

  getUserFields(): UserFieldResponseDto[] {
    let userFields: UserFieldResponseDto[] = [
      {
        id: 1,
        userId: 1,
        fieldId: 1
      },
      {
        id: 2,
        userId: 2,
        fieldId: 2
      },
      {
        id: 3,
        userId: 3,
        fieldId: 3
      }
    ];

    return userFields;
  }

  getUserFieldById(id: number): UserFieldResponseDto | null {
    const userFields = this.getUserFields();
    const userField = userFields.find(u => u.id === id);
    return userField ?? null;
  }

  getUserFieldsByUserId(userId: number): UserFieldResponseDto[] {
    const userFields = this.getUserFields();
    const userFieldList = userFields.filter(u => u.userId === userId);
    return userFieldList;
  }
}
