export interface UserType {
  id: string;
  name: string;
  email: string;
  avatar: string;
  Role: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended';
}
