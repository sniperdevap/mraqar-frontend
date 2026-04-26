import { BuySubscription } from './components/buy-subscription';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buy Subscription - Auto Glass Quoting Platform',
  description: 'Buy a subscription to continue using the Auto Glass Quoting Platform',
};

export default function BuySubscriptionPage() {
  return <BuySubscription />;
}
