'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import Cookies from 'js-cookie';

export function Providers({ children }: { children: React.ReactNode }) {
  const { logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = Cookies.get('auth-token');

    // If there's no token but the store thinks user is authenticated, logout
    if (!token && isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  return <>{children}</>;
}
