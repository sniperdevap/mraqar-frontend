import { Suspense } from 'react';
import { OTPVerificationForm } from '@/components/auth/otp-verification-form';
import { useTranslations } from 'next-intl';

export default function Verify() {
  const tCommon = useTranslations('common.messages');
  return (
    <Suspense fallback={<div>{tCommon('loading')}</div>}>
      <OTPVerificationForm />
    </Suspense>
  );
}
