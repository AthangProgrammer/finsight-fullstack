import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const Expense = sequelize.define(
  'Expense',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    userId: { type: DataTypes.UUID, allowNull: false },
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
    description: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 120] },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0.01, max: 10000000 },
    },
    spentOn: { type: DataTypes.DATEONLY, allowNull: false, validate: { isDate: true } },
  },
  { tableName: 'expenses' },
);
