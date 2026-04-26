import dynamic from 'next/dynamic';

const AccountPage = dynamic(() => import('@/components/account/account-page').then(mod => mod.AccountPage));

export default function Account() {
  return <AccountPage />;
}
