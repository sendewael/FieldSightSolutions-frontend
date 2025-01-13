import { Injectable } from '@angular/core';
import { UserRoleResponseDto } from '../../dtos/UserRole/UserRole-response-dto';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {

  constructor() { }

  getUserRoles(): UserRoleResponseDto[] {
    let userRoles: UserRoleResponseDto[] = [
      {
        id: 1,
        name: "landbouwer"
      },
      {
        id: 2,
        name: "consultant"
      },
      {
        id: 3,
        name: "overheid"
      }
    ];

    return userRoles;
  }

  getUserRoleById(name: string): UserRoleResponseDto | null {
    const roles = this.getUserRoles();
    const role = roles.find(r => r.name.toLowerCase() === name.toLowerCase());
    return role ?? null;
  }
}
