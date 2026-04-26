'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import Cookies from 'js-cookie';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = Cookies.get('auth-token');

    // If there's no token but the store thinks user is authenticated, logout
    if (!token && isAuthenticated) {
      logout();
    }

    setIsHydrated(true);
  }, [isAuthenticated, logout]);

  if (!isHydrated) {
    return null; // Prevent hydration mismatch
  }

  return <>{children}</>;
}
