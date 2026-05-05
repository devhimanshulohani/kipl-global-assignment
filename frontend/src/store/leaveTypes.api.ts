import { api } from './api';
import type { LeaveType } from '../types/api';

interface CreateInput {
  name: string;
  annualQuota: number;
}

interface UpdateInput {
  id: number;
  name?: string;
  annualQuota?: number;
}

export const leaveTypesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listLeaveTypes: build.query<LeaveType[], void>({
      query: () => ({ url: '/api/leave-types' }),
      providesTags: ['LeaveType'],
    }),
    createLeaveType: build.mutation<LeaveType, CreateInput>({
      query: (body) => ({
        url: '/api/leave-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['LeaveType'],
    }),
    updateLeaveType: build.mutation<LeaveType, UpdateInput>({
      query: ({ id, ...body }) => ({
        url: `/api/leave-types/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['LeaveType'],
    }),
    deleteLeaveType: build.mutation<void, number>({
      query: (id) => ({ url: `/api/leave-types/${id}`, method: 'DELETE' }),
      invalidatesTags: ['LeaveType'],
    }),
  }),
});

export const {
  useListLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
} = leaveTypesApi;
