import { SubscriptionStatus } from '@/constants/subscription';
import { User } from './auth';
import { PaginationResponse } from './common';
import { PlanType } from '@/lib/utils/constant';

export interface Subscription {
  id: string;
  subscriptionId: string;
  business: {
    name: string;
    quoteId: string;
  };
  owner: {
    name: string;
    email: string;
  };
  subscriptionDate: string;
  subscriptionAmount: number;
  status?: SubscriptionStatus;
}

export interface UserSubscription {
  user: string;
  plan: string;
  planType: PlanType;
  credits: number;
  premiumCredits: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerifySessionRequest {
  session_id: string;
}

export interface CreateCheckoutSessionResponse {
  checkoutUrl: string;
}

export interface VerifySessionResponse {
  subscriptionId: string;
  user: User;
}

export interface SubscriptionApiResponse {
  _id: string;
  stripeSubscriptionId: string;
  startDate: string;
  endDate: string;
  status: string;
  amount: number;
  canceledAt?: string;
  userId: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetAllSubscriptionsResponse {
  data: SubscriptionApiResponse[];
  pagination: PaginationResponse;
}

export interface BillingAddress {
  city: string | null;
  country: string | null;
  line1: string | null;
  line2: string | null;
  postal_code: string | null;
  state: string | null;
}

export interface BillingAddress {
  city: string | null;
  country: string | null;
  line1: string | null;
  line2: string | null;
  postal_code: string | null;
  state: string | null;
}

export interface BillingDetails {
  address: BillingAddress;
  email: string | null;
  name: string | null;
  phone: string | null;
  tax_id: string | null;
}

export interface CardChecks {
  address_line1_check: string | null;
  address_postal_code_check: string | null;
  cvc_check: string | null;
}

export interface CardNetworks {
  available: string[];
  preferred: string | null;
}

export interface ThreeDSecureUsage {
  supported: boolean;
}

export interface Card {
  brand: string;
  checks: CardChecks;
  country: string;
  display_brand: string;
  exp_month: number;
  exp_year: number;
  fingerprint: string;
  funding: string;
  generated_from: null;
  last4: string;
  networks: CardNetworks;
  regulated_status: string;
  three_d_secure_usage: ThreeDSecureUsage;
  wallet: null;
}

export interface PaymentMethod {
  id: string;
  object: string;
  allow_redisplay: string;
  billing_details: BillingDetails;
  card: Card;
  created: number;
  customer: string;
  customer_account: null;
  livemode: boolean;
  metadata: Record<string, string>;
  type: string;
  radar_options?: Record<string, unknown>; // optional, only present sometimes
}

export interface GetPaymentMethodsResponse {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId: string | null;
}
