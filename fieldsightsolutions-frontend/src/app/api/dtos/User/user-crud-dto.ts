export interface UserCrudDto {
  id: number;
  userRole_id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  adres: string;
  gemeente: string;
  bus?: string | null;
  is_active: boolean;
  isEditing?: boolean;
  role?: {
    id: number;
    name: string;
  };
}
