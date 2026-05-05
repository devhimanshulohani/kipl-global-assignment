import { api } from './api';
import type { AuthUser } from '../types/api';

interface LoginResponse {
  user: AuthUser;
}

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    me: build.query<AuthUser, void>({
      query: () => ({ url: '/api/auth/me' }),
      providesTags: ['Auth'],
    }),
    login: build.mutation<
      LoginResponse,
      { username: string; password: string }
    >({
      query: (body) => ({
        url: '/api/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: '/api/auth/logout', method: 'POST' }),
    }),
  }),
});

export const { useMeQuery, useLoginMutation, useLogoutMutation } = authApi;
