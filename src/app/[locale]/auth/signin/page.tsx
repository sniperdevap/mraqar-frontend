import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Auto Glass Quoting Platform',
  description: 'Login to your Auto Glass Quoting Platform account',
};

export default function SignIn() {
  return <LoginForm />;
}
