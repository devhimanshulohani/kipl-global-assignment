import { DataTypes, Model, Optional, NonAttribute } from 'sequelize';
import { sequelize } from '../config/db';
import type { Permission } from './Permission';

interface RoleAttributes {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type RoleCreationAttributes = Optional<
  RoleAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  declare id: number;
  declare name: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare permissions?: NonAttribute<Permission[]>;
}

Role.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    sequelize,
    tableName: 'roles',
    modelName: 'Role',
    underscored: true,
  }
);
