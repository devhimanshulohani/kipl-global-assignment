import { api } from './api';
import type { LeaveRequest } from '../types/api';

interface ApplyInput {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

interface ActInput {
  id: number;
  remark: string;
}

export const leavesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listMyLeaves: build.query<LeaveRequest[], void>({
      query: () => ({ url: '/api/leaves/me' }),
      providesTags: ['LeaveRequest'],
    }),
    listPendingLeaves: build.query<LeaveRequest[], void>({
      query: () => ({ url: '/api/leaves/pending' }),
      providesTags: ['LeaveRequest'],
    }),
    listTeamLeaves: build.query<LeaveRequest[], void>({
      query: () => ({ url: '/api/leaves/team' }),
      providesTags: ['LeaveRequest'],
    }),
    listAllLeaves: build.query<LeaveRequest[], void>({
      query: () => ({ url: '/api/leaves/all' }),
      providesTags: ['LeaveRequest'],
    }),
    applyLeave: build.mutation<LeaveRequest, ApplyInput>({
      query: (body) => ({ url: '/api/leaves', method: 'POST', body }),
      invalidatesTags: ['LeaveRequest'],
    }),
    approveLeave: build.mutation<LeaveRequest, ActInput>({
      query: ({ id, remark }) => ({
        url: `/api/leaves/${id}/approve`,
        method: 'POST',
        body: { remark },
      }),
      invalidatesTags: ['LeaveRequest'],
    }),
    rejectLeave: build.mutation<LeaveRequest, ActInput>({
      query: ({ id, remark }) => ({
        url: `/api/leaves/${id}/reject`,
        method: 'POST',
        body: { remark },
      }),
      invalidatesTags: ['LeaveRequest'],
    }),
    cancelLeave: build.mutation<void, number>({
      query: (id) => ({ url: `/api/leaves/${id}`, method: 'DELETE' }),
      invalidatesTags: ['LeaveRequest'],
    }),
  }),
});

export const {
  useListMyLeavesQuery,
  useListPendingLeavesQuery,
  useListTeamLeavesQuery,
  useListAllLeavesQuery,
  useApplyLeaveMutation,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
  useCancelLeaveMutation,
} = leavesApi;
