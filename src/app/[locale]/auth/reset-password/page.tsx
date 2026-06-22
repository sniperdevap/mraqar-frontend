import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password - Mr aqar',
  description: 'Reset your password for Mr aqar',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
