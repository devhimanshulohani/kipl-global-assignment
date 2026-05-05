import { DataTypes, Model, Optional, NonAttribute } from 'sequelize';
import { sequelize } from '../config/db';
import { LeaveStatus, leaveStatusValues } from '../enums/LeaveStatus';
import type { User } from './User';
import type { LeaveType } from './LeaveType';

interface LeaveRequestAttributes {
  id: number;
  userId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  remark: string | null;
  actedBy: number | null;
  actedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type LeaveRequestCreationAttributes = Optional<
  LeaveRequestAttributes,
  'id' | 'status' | 'remark' | 'actedBy' | 'actedAt' | 'createdAt' | 'updatedAt'
>;

export class LeaveRequest
  extends Model<LeaveRequestAttributes, LeaveRequestCreationAttributes>
  implements LeaveRequestAttributes
{
  declare id: number;
  declare userId: number;
  declare leaveTypeId: number;
  declare startDate: string;
  declare endDate: string;
  declare reason: string;
  declare status: LeaveStatus;
  declare remark: string | null;
  declare actedBy: number | null;
  declare actedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare requester?: NonAttribute<User>;
  declare leaveType?: NonAttribute<LeaveType>;
  declare actor?: NonAttribute<User>;
}

LeaveRequest.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    leaveTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'leave_types', key: 'id' },
    },
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM(...leaveStatusValues),
      allowNull: false,
      defaultValue: LeaveStatus.Pending,
    },
    remark: { type: DataTypes.TEXT, allowNull: true },
    actedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    actedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'leave_requests',
    modelName: 'LeaveRequest',
    underscored: true,
  }
);
