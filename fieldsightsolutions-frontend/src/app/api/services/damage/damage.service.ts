import { Injectable } from '@angular/core';
import { DamageResponseDto } from '../../dtos/Damage/Damage-response-dto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class DamageService {
  private apiUrl = `${environment.baseUrl}/damages`

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
    return this.httpClient.get<DamageResponseDto[]>(`${this.apiUrl}/all`, { withCredentials: true });
  }
}
