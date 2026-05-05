import { z } from 'zod';
import { UserRole, userRoleValues } from '../../enums/UserRole';

// Per spec section 5.6: HR creates Employee or Manager accounts.
export const createUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
  role: z.enum([UserRole.Employee, UserRole.Manager]),
  parentId: z.number().int().positive().nullable().optional(),
});

export const updateUserSchema = z.object({
  role: z.enum(userRoleValues as [UserRole, ...UserRole[]]).optional(),
  parentId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
