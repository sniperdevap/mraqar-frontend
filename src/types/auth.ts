import { SubscriptionStatus } from '@/constants/subscription';
import { UserSubscription } from '@/lib/api/subscription-plan';

export type UserRole = 'super_admin' | 'staff' | 'business_owner' | 'user';

export interface Subscription {
  _id: string;
  status: SubscriptionStatus;
  amount: number;
  startDate: string;
  endDate: string;
  credits: number;
  premiumCredits: number;
  canceledAt?: string;
  planType: string;
  isActive: boolean;
  stripeSubscriptionId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  phoneNumber: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  subscriptions?: UserSubscription[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  id: string;
  phoneNumber: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<boolean>;
  signup: (payload: import('@/lib/api/auth').SignupRequest) => Promise<boolean>;
  /** Stores a session returned by the API (password or Google sign-in). */
  setSession: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  refreshSubscriptions: () => Promise<void>;
}
