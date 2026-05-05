import type { UserRole } from '../enums/UserRole';
import type { LeaveStatus } from '../enums/LeaveStatus';

export interface Role {
  id: number;
  name: UserRole;
}

// Slim shape for embedded role refs (backend only fetches name).
export type RoleRef = Pick<Role, 'name'>;

export interface AuthUser {
  id: number;
  username: string;
  role: Role;
  permissions: string[];
}

export interface ApiError {
  message: string;
  errors?: unknown;
}

export interface UserSummary {
  id: number;
  username: string;
  role: RoleRef;
}

export interface Attendance {
  id: number;
  userId: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  hoursWorked: number | null;
  user?: UserSummary;
}

export interface LeaveType {
  id: number;
  name: string;
  annualQuota: number;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  remark: string | null;
  actedBy: number | null;
  actedAt: string | null;
  createdAt: string;
  updatedAt: string;
  leaveType?: LeaveType;
  requester?: UserSummary;
}
