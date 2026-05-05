// Mirror of backend/src/auth/permissions.ts.
export const PERMISSIONS = {
  ATTENDANCE_READ_OWN: 'attendance:read:own',
  ATTENDANCE_WRITE: 'attendance:write',
  ATTENDANCE_READ_TEAM: 'attendance:read:team',
  ATTENDANCE_READ_ALL: 'attendance:read:all',
  LEAVE_APPLY: 'leave:apply',
  LEAVE_READ_OWN: 'leave:read:own',
  LEAVE_CANCEL_OWN: 'leave:cancel:own',
  LEAVE_READ_PENDING: 'leave:read:pending',
  LEAVE_READ_ALL: 'leave:read:all',
  LEAVE_APPROVE: 'leave:approve',
  LEAVE_TYPE_MANAGE: 'leave_type:manage',
  USER_MANAGE: 'user:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
