import { Injectable } from '@angular/core';
import { DamageResponseDto } from '../../dtos/Damage/Damage-response-dto';

@Injectable({
  providedIn: 'root'
})
export class DamageService {

  constructor() { }

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
}
