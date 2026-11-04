import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: { is: /^[a-zA-Z0-9_]{3,30}$/ },
    },
    passwordHash: { type: DataTypes.STRING(72), allowNull: false },
    tokenVersion: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    failedLoginCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    lockedUntil: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: 'users',
    defaultScope: { attributes: { exclude: ['passwordHash'] } },
    scopes: { withPassword: { attributes: { include: ['passwordHash'] } } },
  },
);
