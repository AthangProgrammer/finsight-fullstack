export const expenseJson = (expense) => ({
  id: expense.id,
  description: expense.description,
  amount: Number(expense.amount),
  spentOn: expense.spentOn,
  categoryId: expense.categoryId,
  category: expense.Category?.name ?? null,
});
