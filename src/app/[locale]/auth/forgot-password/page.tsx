import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password - Mr aqar',
  description: 'Reset your password for Mr aqar',
};

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}
