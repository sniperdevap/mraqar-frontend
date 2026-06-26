import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Mr aqar',
  description: 'Login to your Mr aqar account',
};

export default function SignIn() {
  return <LoginForm />;
}
