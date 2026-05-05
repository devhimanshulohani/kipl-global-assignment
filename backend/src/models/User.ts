import { DataTypes, Model, Optional, NonAttribute } from 'sequelize';
import { sequelize } from '../config/db';
import type { Role } from './Role';

interface UserAttributes {
  id: number;
  username: string;
  passwordHash: string;
  roleId: number;
  parentId: number | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'parentId' | 'isActive' | 'createdAt' | 'updatedAt'
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare username: string;
  declare passwordHash: string;
  declare roleId: number;
  declare parentId: number | null;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare role?: NonAttribute<Role>;

  // Drop the FK from JSON when the joined role is loaded — the API surfaces { role: { id, name } }.
  toJSON() {
    const json = super.toJSON() as unknown as Record<string, unknown>;
    if (json.role) delete json.roleId;
    return json;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'roles', key: 'id' },
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    underscored: true,
    defaultScope: {
      attributes: { exclude: ['passwordHash'] },
    },
    scopes: {
      withPassword: {},
    },
  }
);
