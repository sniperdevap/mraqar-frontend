'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import Cookies from 'js-cookie';

export const useAuthCheck = () => {
  const { isAuthenticated, user, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const token = Cookies.get('auth-token');

    // If there's no token but the store thinks user is authenticated, logout
    if (!token && isAuthenticated) {
      useAuthStore.getState().logout();
    }

    setLoading(false);
  }, [isAuthenticated, setLoading]);

  return { isAuthenticated, user };
};
