import { api } from './api';
import type { UserRole } from '../enums/UserRole';
import type { Role } from '../types/api';

interface UserRow {
  id: number;
  username: string;
  role: Role;
  parentId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserInput {
  username: string;
  password: string;
  role: UserRole;
  parentId?: number | null;
}

interface UpdateUserInput {
  id: number;
  role?: UserRole;
  parentId?: number | null;
  isActive?: boolean;
}

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<UserRow[], void>({
      query: () => ({ url: '/api/users' }),
      providesTags: ['User'],
    }),
    createUser: build.mutation<UserRow, CreateUserInput>({
      query: (body) => ({ url: '/api/users', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateUser: build.mutation<UserRow, UpdateUserInput>({
      query: ({ id, ...body }) => ({
        url: `/api/users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} = usersApi;

export type { UserRow };
