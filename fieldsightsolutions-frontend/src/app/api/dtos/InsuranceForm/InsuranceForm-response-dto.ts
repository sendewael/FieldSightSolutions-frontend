export interface InsuranceFormResponseDto {
  id: number;
  damage: number; // ID van het gerelateerde damage-object
  field: {
    id: number,
    name: string; // Veldnaam
    acreage: string; // Oppervlakte
    crop: string; // Gewas
    municipality: string; // Gemeente
    postalcode: string; // Postcode
    oever?: string | null; // Optioneel
    risico?: string | null; // Optioneel
  }; // Veld object met details
  startDate: string;
  endDate: string;
  status: number;
  damage_type?: string; // Alleen voor lezen (backend mapping)
  estimated_cost: number;
  description: string;
  insurance: boolean;
}
