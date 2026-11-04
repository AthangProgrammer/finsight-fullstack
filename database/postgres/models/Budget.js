import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const Budget = sequelize.define(
  'Budget',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true },
    monthlyAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0, max: 10000000 },
    },
  },
  { tableName: 'budgets' },
);
