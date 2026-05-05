export const UserRole = {
  Employee: 'employee',
  Manager:  'manager',
  HR:       'hr',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const userRoleValues: UserRole[] = Object.values(UserRole);

const labels: Record<UserRole, string> = {
  [UserRole.Employee]: 'Employee',
  [UserRole.Manager]:  'Manager',
  [UserRole.HR]:       'HR',
};

export const userRoleLabel = (role: UserRole): string => labels[role];
