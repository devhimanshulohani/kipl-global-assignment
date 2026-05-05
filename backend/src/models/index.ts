import { User } from './User';
import { Role } from './Role';
import { Permission } from './Permission';
import { LeaveType } from './LeaveType';
import { LeaveRequest } from './LeaveRequest';
import { Attendance } from './Attendance';
import { Session } from './Session';

Role.belongsToMany(Permission, {
  through: 'role_permissions',
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: 'role_permissions',
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles',
});

User.belongsTo(Role, { as: 'role', foreignKey: 'roleId' });
Role.hasMany(User, { as: 'users', foreignKey: 'roleId' });

// Self-referential parent (employee→manager→hr). Role-pair enforced in users.service.validateParent.
User.hasMany(User, { as: 'reports', foreignKey: 'parentId' });
User.belongsTo(User, { as: 'parent', foreignKey: 'parentId' });

User.hasMany(Session, { as: 'sessions', foreignKey: 'userId' });
Session.belongsTo(User, { as: 'user', foreignKey: 'userId' });

User.hasMany(LeaveRequest, { as: 'leaveRequests', foreignKey: 'userId' });
LeaveRequest.belongsTo(User, { as: 'requester', foreignKey: 'userId' });
LeaveRequest.belongsTo(LeaveType, { as: 'leaveType', foreignKey: 'leaveTypeId' });
LeaveRequest.belongsTo(User, { as: 'actor', foreignKey: 'actedBy' });

User.hasMany(Attendance, { as: 'attendance', foreignKey: 'userId' });
Attendance.belongsTo(User, { as: 'user', foreignKey: 'userId' });

export {
  User,
  Role,
  Permission,
  LeaveType,
  LeaveRequest,
  Attendance,
  Session,
};
