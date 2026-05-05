import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import type { MongoAbility } from '@casl/ability';
import type { AuthUser } from '../types/api';
import { LeaveStatus } from '../enums/LeaveStatus';
import { PERMISSIONS, type Permission } from './permissions';

export type Actions =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'manage';

export type Subjects =
  | 'User'
  | 'Attendance'
  | 'LeaveRequest'
  | 'LeaveType'
  | 'all';

export type AppAbility = MongoAbility;

/**
 * Mirrors backend/src/auth/abilities.ts. Backend stays the source of truth
 * for enforcement; this copy drives UI rendering decisions only. Both
 * versions read from the user's permission set — the UI doesn't need to
 * know which role grants which permission.
 */
export function defineAbilitiesFor(user: AuthUser): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
  const granted = new Set<string>(user.permissions);
  const has = (perm: Permission) => granted.has(perm);

  can('read', 'User', { id: user.id });
  can('read', 'LeaveType');

  if (has(PERMISSIONS.ATTENDANCE_READ_OWN)) {
    can('read', 'Attendance', { userId: user.id });
  }
  if (has(PERMISSIONS.ATTENDANCE_WRITE)) {
    can('create', 'Attendance', { userId: user.id });
    can('update', 'Attendance', { userId: user.id });
  }
  if (has(PERMISSIONS.ATTENDANCE_READ_TEAM)) {
    can('read', 'Attendance', { 'user.parentId': user.id });
    can('read', 'User', { parentId: user.id });
  }
  if (has(PERMISSIONS.ATTENDANCE_READ_ALL)) {
    can('read', 'Attendance');
  }

  if (has(PERMISSIONS.LEAVE_READ_OWN)) {
    can('read', 'LeaveRequest', { userId: user.id });
  }
  if (has(PERMISSIONS.LEAVE_APPLY)) {
    can('create', 'LeaveRequest', { userId: user.id });
  }
  if (has(PERMISSIONS.LEAVE_CANCEL_OWN)) {
    can('delete', 'LeaveRequest', {
      userId: user.id,
      status: LeaveStatus.Pending,
    });
  }
  if (has(PERMISSIONS.LEAVE_READ_PENDING)) {
    can('read', 'LeaveRequest', { 'requester.parentId': user.id });
  }
  if (has(PERMISSIONS.LEAVE_READ_ALL)) {
    can('read', 'LeaveRequest');
  }
  if (has(PERMISSIONS.LEAVE_APPROVE)) {
    can('approve', 'LeaveRequest', {
      'requester.parentId': user.id,
      userId: { $ne: user.id },
    });
  }

  if (has(PERMISSIONS.LEAVE_TYPE_MANAGE)) {
    can('manage', 'LeaveType');
  }
  if (has(PERMISSIONS.USER_MANAGE)) {
    can('read', 'User');
    can('manage', 'User');
  }

  return build();
}
