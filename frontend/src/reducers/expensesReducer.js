export const initialExpensesState = {
  items: [],
  page: 1,
  limit: 20,
  total: 0,
  filters: { q: '', categoryId: '', from: '' },
};

export function expensesReducer(state, action) {
  switch (action.type) {
    case 'loaded':
      return { ...state, items: action.items, page: action.page, limit: action.limit, total: action.total };
    case 'added':
      return { ...state, items: [action.item, ...state.items].slice(0, state.limit), total: state.total + 1 };
    case 'updated':
      return { ...state, items: state.items.map((item) => (item.id === action.item.id ? action.item : item)) };
    case 'removed':
      return { ...state, items: state.items.filter((item) => item.id !== action.id), total: state.total - 1 };
    case 'filterChanged':
      return { ...state, page: 1, filters: { ...state.filters, ...action.filters } };
    case 'pageChanged':
      return { ...state, page: action.page };
    default:
      return state;
  }
}
