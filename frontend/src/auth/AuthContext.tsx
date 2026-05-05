import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAppDispatch } from '../store/hooks';
import {
  useMeQuery,
  useLoginMutation,
  useLogoutMutation,
} from '../store/auth.api';
import { api } from '../store/api';
import { defineAbilitiesFor } from './abilities';
import type { AppAbility } from './abilities';
import type { AuthUser } from '../types/api';

interface AuthValue {
  user: AuthUser | null;
  ability: AppAbility | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  // Always probe /me on mount; baseQuery skips its 401 redirect for this endpoint.
  const { data: user, isLoading } = useMeQuery();
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  const ability = useMemo(
    () => (user ? defineAbilitiesFor(user) : null),
    [user]
  );

  const login = async (username: string, password: string) => {
    await loginMutation({ username, password }).unwrap();
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // ignore — clear local state regardless
    }
    dispatch(api.util.resetApiState());
  };

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, ability, loading: isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
