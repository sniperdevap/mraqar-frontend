import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password - Auto Glass Quoting Platform',
  description: 'Reset your password for Auto Glass Quoting Platform',
};

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}
