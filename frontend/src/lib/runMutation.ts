import { toast } from 'sonner';

// Wraps an RTK Query trigger: surfaces backend error via toast, returns success boolean.
export const runMutation = async (
  triggerResult: { unwrap(): Promise<unknown> },
  opts: { success?: string; error?: string } = {}
): Promise<boolean> => {
  try {
    await triggerResult.unwrap();
    if (opts.success) toast.success(opts.success);
    return true;
  } catch (err: any) {
    toast.error(err?.data?.message || opts.error || 'Action failed');
    return false;
  }
};
