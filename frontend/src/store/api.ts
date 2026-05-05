import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { SESSION_FLASH_KEY } from '../lib/sessionFlash';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  credentials: 'include',
});

// 401 → flash + redirect to /login, except on /login itself or the /me probe.
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, store, extraOptions) => {
  const result = await rawBaseQuery(args, store, extraOptions);

  if (result.error?.status === 401) {
    const url = typeof args === 'string' ? args : args.url;
    const isAuthProbe =
      url.includes('/api/auth/login') || url.includes('/api/auth/me');
    if (!isAuthProbe && window.location.pathname !== '/login') {
      sessionStorage.setItem(
        SESSION_FLASH_KEY,
        'Session expired — please log in again'
      );
      window.location.href = '/login';
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Auth', 'Attendance', 'LeaveRequest', 'LeaveType', 'User'],
  endpoints: () => ({}),
});
