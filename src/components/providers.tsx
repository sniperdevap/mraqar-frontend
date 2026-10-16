'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import Cookies from 'js-cookie';

export function Providers({ children }: { children: React.ReactNode }) {
  const { logout, isAuthenticated, setSession } = useAuthStore();

  useEffect(() => {
    const token = Cookies.get('auth-token');

    // Signed in on the new (Astro) pages: the session is in the cookies only.
    if (token && !isAuthenticated) {
      try {
        const user = JSON.parse(Cookies.get('auth-user') || 'null');
        if (user) setSession(token, user);
      } catch {}
    }

    // If there's no token but the store thinks user is authenticated, logout
    if (!token && isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout, setSession]);

  return <>{children}</>;
}
