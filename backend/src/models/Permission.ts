import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface PermissionAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type PermissionCreationAttributes = Optional<
  PermissionAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  declare id: number;
  declare name: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Permission.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    sequelize,
    tableName: 'permissions',
    modelName: 'Permission',
    underscored: true,
  }
);
