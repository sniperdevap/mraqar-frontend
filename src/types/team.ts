export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  permissions?: {
    canEditQuoteLine?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
