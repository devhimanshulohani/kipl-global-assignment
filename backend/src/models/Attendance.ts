import { DataTypes, Model, Optional, NonAttribute } from 'sequelize';
import { sequelize } from '../config/db';
import type { User } from './User';

interface AttendanceAttributes {
  id: number;
  userId: number;
  date: string;
  checkIn: Date | null;
  checkOut: Date | null;
  hoursWorked?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type AttendanceCreationAttributes = Optional<
  AttendanceAttributes,
  'id' | 'checkOut' | 'hoursWorked' | 'createdAt' | 'updatedAt'
>;

export class Attendance
  extends Model<AttendanceAttributes, AttendanceCreationAttributes>
  implements AttendanceAttributes
{
  declare id: number;
  declare userId: number;
  declare date: string;
  declare checkIn: Date | null;
  declare checkOut: Date | null;
  declare hoursWorked?: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare user?: NonAttribute<User>;
}

Attendance.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    checkIn: { type: DataTypes.DATE, allowNull: true },
    checkOut: { type: DataTypes.DATE, allowNull: true },
    hoursWorked: {
      type: DataTypes.VIRTUAL,
      get(this: any) {
        const ci = this.getDataValue('checkIn');
        const co = this.getDataValue('checkOut');
        if (!ci || !co) return null;
        const ms = new Date(co).getTime() - new Date(ci).getTime();
        return Number((ms / 3600000).toFixed(2));
      },
    },
  },
  {
    sequelize,
    tableName: 'attendance',
    modelName: 'Attendance',
    underscored: true,
    indexes: [{ unique: true, fields: ['user_id', 'date'] }],
  }
);
