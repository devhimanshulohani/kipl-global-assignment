import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface LeaveTypeAttributes {
  id: number;
  name: string;
  annualQuota: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type LeaveTypeCreationAttributes = Optional<
  LeaveTypeAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class LeaveType
  extends Model<LeaveTypeAttributes, LeaveTypeCreationAttributes>
  implements LeaveTypeAttributes
{
  declare id: number;
  declare name: string;
  declare annualQuota: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

LeaveType.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    annualQuota: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'leave_types',
    modelName: 'LeaveType',
    underscored: true,
  }
);
