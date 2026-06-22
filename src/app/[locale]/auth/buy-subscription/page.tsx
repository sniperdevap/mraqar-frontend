import { BuySubscription } from './components/buy-subscription';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buy Subscription - Mr aqar',
  description: 'Buy a subscription to continue using Mr aqar',
};

export default function BuySubscriptionPage() {
  return <BuySubscription />;
}
