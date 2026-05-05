import { api } from './api';
import type { Attendance } from '../types/api';

type Scope = 'me' | 'team' | 'all';

export const attendanceApi = api.injectEndpoints({
  endpoints: (build) => ({
    getToday: build.query<Attendance | null, void>({
      query: () => ({ url: '/api/attendance/today' }),
      providesTags: ['Attendance'],
    }),
    listAttendance: build.query<Attendance[], Scope>({
      query: (scope) => ({ url: `/api/attendance/${scope}` }),
      providesTags: ['Attendance'],
    }),
    checkIn: build.mutation<Attendance, void>({
      query: () => ({ url: '/api/attendance/check-in', method: 'POST' }),
      invalidatesTags: ['Attendance'],
    }),
    checkOut: build.mutation<Attendance, void>({
      query: () => ({ url: '/api/attendance/check-out', method: 'POST' }),
      invalidatesTags: ['Attendance'],
    }),
  }),
});

export const {
  useGetTodayQuery,
  useListAttendanceQuery,
  useCheckInMutation,
  useCheckOutMutation,
} = attendanceApi;
