export interface UserResponseDto {
  id: number;
  userRole_id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  adres: string;
  gemeente: string;
  role_name?: string;
  is_active: boolean;
  isEditing?: boolean;
}
