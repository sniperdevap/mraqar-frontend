import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password - Auto Glass Quoting Platform',
  description: 'Reset your password for Auto Glass Quoting Platform',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
