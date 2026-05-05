import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface SessionAttributes {
  id: string;
  userId: number;
  lastActivityAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

type SessionCreationAttributes = Optional<
  SessionAttributes,
  'createdAt' | 'updatedAt'
>;

export class Session
  extends Model<SessionAttributes, SessionCreationAttributes>
  implements SessionAttributes
{
  declare id: string;
  declare userId: number;
  declare lastActivityAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Session.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    lastActivityAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    tableName: 'sessions',
    modelName: 'Session',
    underscored: true,
  }
);
