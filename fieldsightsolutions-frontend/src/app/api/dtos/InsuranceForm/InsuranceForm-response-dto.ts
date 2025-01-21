export interface InsuranceFormResponseDto {
    id: number;
    damage: number; // ID van het gerelateerde damage-object
    field: number; // ID van het gerelateerde field-object
    startDate: string;
    endDate: string;
    status: number;
    field_name?: string; // Alleen voor lezen (backend mapping)
    damage_type?: string; // Alleen voor lezen (backend mapping)
    estimated_cost: number;
    description: string;
    insurance: boolean;
  }
  