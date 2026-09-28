import { Suspense } from 'react';
import { PaymentResult } from './result';

export default function PaymentResultPage() {
  return (
    <Suspense>
      <PaymentResult />
    </Suspense>
  );
}
