import { User } from './User.js';
import { Category } from './Category.js';
import { Expense } from './Expense.js';
import { Budget } from './Budget.js';

User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId' });
Category.hasMany(Expense, { foreignKey: 'categoryId', onDelete: 'RESTRICT' });
Expense.belongsTo(Category, { foreignKey: 'categoryId' });
User.hasOne(Budget, { foreignKey: 'userId', onDelete: 'CASCADE' });
Budget.belongsTo(User, { foreignKey: 'userId' });

export const models = { User, Category, Expense, Budget };
