export const LeaveStatus = {
  Pending:  'pending',
  Approved: 'approved',
  Rejected: 'rejected',
} as const;

export type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus];

const labels: Record<LeaveStatus, string> = {
  [LeaveStatus.Pending]:  'Pending',
  [LeaveStatus.Approved]: 'Approved',
  [LeaveStatus.Rejected]: 'Rejected',
};

export const leaveStatusLabel = (s: LeaveStatus): string => labels[s];
