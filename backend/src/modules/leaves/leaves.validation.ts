import { z } from 'zod';

export const applySchema = z.object({
  leaveTypeId: z.number().int().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
  reason: z.string().min(1),
});

export const actionSchema = z.object({
  remark: z.string().min(1, 'remark is required'),
});

export type ApplyInput = z.infer<typeof applySchema>;
export type ActionInput = z.infer<typeof actionSchema>;
