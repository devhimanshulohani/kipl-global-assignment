import { z } from 'zod';

export const createLeaveTypeSchema = z.object({
  name: z.string().min(1),
  annualQuota: z.number().int().nonnegative(),
});

export const updateLeaveTypeSchema = z.object({
  name: z.string().min(1).optional(),
  annualQuota: z.number().int().nonnegative().optional(),
});

export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>;
export type UpdateLeaveTypeInput = z.infer<typeof updateLeaveTypeSchema>;
