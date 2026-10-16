import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentResult } from "./payment-result";

export const metadata: Metadata = { title: "Payment - Mr aqar", robots: { index: false, follow: false } };

/** MyFatoorah sends the customer back here (via the API callback) after paying. */
export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <PaymentResult />
    </Suspense>
  );
}
