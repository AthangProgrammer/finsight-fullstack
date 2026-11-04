import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const Category = sequelize.define(
  'Category',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(40), allowNull: false, unique: true, validate: { len: [1, 40] } },
  },
  { tableName: 'categories' },
);
