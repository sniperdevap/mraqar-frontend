'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { AuthState } from '@/types/auth';
import { login as loginAPI, signup as signupAPI } from '@/lib/api/auth';
import { getMySubscriptions } from '@/lib/api/subscription-plan';
import { AUTH_COOKIE_DAYS } from '@/lib/utils/api';

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (phoneNumber: string, password: string): Promise<boolean> => {
        set({ isLoading: true });

        try {
          const response = await loginAPI({ phoneNumber, password });
          const { token, user: userData } = response;

          // subscriptions are now included in the userData from the backend response
          // Remove manual fetch to optimize login speed
          const userWithSubs = userData;


          Cookies.set('auth-token', token, { expires: AUTH_COOKIE_DAYS });
          Cookies.set('auth-user', JSON.stringify(userWithSubs), { expires: AUTH_COOKIE_DAYS });

          set({
            user: userWithSubs,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (payload: { name: string; phoneNumber: string; password: string; avatar: string }): Promise<boolean> => {
        set({ isLoading: true });

        try {
          await signupAPI({
            name: payload.name,
            phoneNumber: payload.phoneNumber,
            password: payload.password,
            avatar: payload.avatar,
          });
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        Cookies.remove('auth-token');
        Cookies.remove('auth-user');
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      refreshSubscriptions: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          const subscriptions = await getMySubscriptions();
          const updatedUser = { ...user, subscriptions };

          Cookies.set('auth-user', JSON.stringify(updatedUser), { expires: AUTH_COOKIE_DAYS });
          set({ user: updatedUser });
        } catch (error) {
          console.error('Failed to refresh subscriptions:', error);
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
