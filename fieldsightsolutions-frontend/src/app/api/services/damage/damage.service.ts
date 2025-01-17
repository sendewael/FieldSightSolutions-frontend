import { Injectable } from '@angular/core';
import { DamageResponseDto } from '../../dtos/Damage/Damage-response-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DamageService {

  constructor(private httpClient: HttpClient) {
  }

  getDamages(): DamageResponseDto[] {
    let damages: DamageResponseDto[] = [
      {
        id: 1,
        type: "Flood"
      },
      {
        id: 2,
        type: "Hail"
      },
      {
        id: 3,
        type: "Fire"
      }
    ];

    return damages;
  }

  getDamageById(id: number): DamageResponseDto | null {
    const damages = this.getDamages();
    const damage = damages.find(d => d.id === id);
    return damage ?? null;
  }

  getDamageByType(type: string): DamageResponseDto | null {
    const damages = this.getDamages();
    const damage = damages.find(d => d.type.toLowerCase() === type.toLowerCase());
    return damage ?? null;
  }


  // Fetch all damages
  getAllDamages(): Observable<DamageResponseDto[]> {
    return this.httpClient.get<DamageResponseDto[]>(`http://localhost:8000/api/damages/all`, { withCredentials: true });
  }
}
