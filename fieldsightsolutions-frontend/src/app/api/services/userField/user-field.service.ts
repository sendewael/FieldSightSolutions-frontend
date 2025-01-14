import { Injectable } from '@angular/core';
import { UserFieldResponseDto } from '../../dtos/UserField/UserField-response-dto';

@Injectable({
  providedIn: 'root'
})
export class UserFieldService {

  constructor() { }

  private userFields: UserFieldResponseDto[] = [
    // {
    //   id: 1,
    //   userId: 2,
    //   fieldId: 1
    // },
    // {
    //   id: 2,
    //   userId: 1,
    //   fieldId: 2
    // },
    // {
    //   id: 3,
    //   userId: 1,
    //   fieldId: 3
    // },
    // {
    //   id: 4,
    //   userId: 1,
    //   fieldId: 4
    // },
    // {
    //   id: 6,
    //   userId: 1,
    //   fieldId: 6
    // },
  ];

  getUserFields(): UserFieldResponseDto[] {
    return this.userFields;
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

  addUserField(userId: number, fieldId: number): void {
    const newId = this.userFields.length > 0 ? Math.max(...this.userFields.map(u => u.id)) + 1 : 1;

    const newUserField: UserFieldResponseDto = {
      id: newId,
      userId,
      fieldId
    };

    this.userFields.push(newUserField);
  }

  getUserFieldByFieldId(fieldId: number): UserFieldResponseDto | null {
    return this.userFields.find(u => u.fieldId === fieldId) ?? null;
  }

  deleteUserField(id: number): void {
    console.log(`userField with id ${id} removed`);
  }
}
