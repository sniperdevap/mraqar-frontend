// Subscription status constants
const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
  TRIALING: 'trialing',
} as const;

// Freeze the subscription status object to prevent modifications
Object.freeze(SUBSCRIPTION_STATUS);

export default SUBSCRIPTION_STATUS;

// Type for subscription status
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];
