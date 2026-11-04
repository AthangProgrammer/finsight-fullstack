import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Empty from '../components/Empty.jsx';
import Heading from '../components/Heading.jsx';
import Panel from '../components/Panel.jsx';
import { useApi } from '../hooks/useApi.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { formatDate, money, today } from '../lib/money.js';
import { validateAmount } from '../lib/validate.js';
import { expensesReducer, initialExpensesState } from '../reducers/expensesReducer.js';
import styles from './Transactions.module.css';

const blankForm = { description: '', amount: '', categoryId: '', spentOn: today() };

const toQuery = ({ page, limit, filters }) => {
  const params = new URLSearchParams({ page, limit });
  Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
  return params.toString();
};

export default function Transactions() {
  const request = useApi();
  const [params, setParams] = useSearchParams();
  const [state, dispatch] = useReducer(expensesReducer, initialExpensesState);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const dateInput = useRef(null);

  const q = params.get('q') ?? '';
  const debouncedQ = useDebounce(q);
  const { items, page, limit, total, filters } = state;
  const pages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    request('/categories')
      .then((data) => {
        setCategories(data.items);
        setForm((current) => ({ ...current, categoryId: current.categoryId || data.items[0]?.id || '' }));
      })
      .catch((err) => setMessage(err.message));
  }, [request]);

  useEffect(() => {
    dispatch({ type: 'filterChanged', filters: { q: debouncedQ } });
  }, [debouncedQ]);

  useEffect(() => {
    request(`/expenses?${toQuery({ page, limit, filters })}`)
      .then((data) => dispatch({ type: 'loaded', ...data }))
      .catch((err) => setMessage(err.message));
  }, [request, page, limit, filters]);

  const changeFilter = useCallback((change) => dispatch({ type: 'filterChanged', filters: change }), []);

  const resetForm = () => {
    setForm({ ...blankForm, categoryId: categories[0]?.id ?? '', spentOn: today() });
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    const invalid = validateAmount(form.amount);
    if (invalid) return setMessage(invalid);
    setBusy(true);
    setMessage('');
    const body = { ...form, amount: Number(form.amount), categoryId: Number(form.categoryId) };
    try {
      if (editingId) {
        const data = await request(`/expenses/${editingId}`, { method: 'PATCH', body });
        dispatch({ type: 'updated', item: data.expense });
        setMessage('Expense updated.');
      } else {
        const data = await request('/expenses', { method: 'POST', body });
        dispatch({ type: 'added', item: data.expense });
        setMessage('Expense added.');
      }
      resetForm();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const edit = (item) => {
    setForm({ description: item.description, amount: String(item.amount), categoryId: item.categoryId, spentOn: item.spentOn });
    setEditingId(item.id);
    setShowForm(true);
    setMessage('');
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await request(`/expenses/${id}`, { method: 'DELETE' });
      dispatch({ type: 'removed', id });
    } catch (err) {
      setMessage(err.message);
    }
  };

  const setQuery = (value) => setParams(value ? { q: value } : {}, { replace: true });

  return (
    <>
      <Heading
        title="Transactions"
        subtitle="Review and manage your financial activity."
        action={
          <button className="primary pale" onClick={() => setShowForm(!showForm)}>
            + &nbsp; Add Transaction
          </button>
        }
      />
      {showForm && (
        <Panel className="add-expense">
          <h2>{editingId ? 'Edit expense' : 'Add an expense'}</h2>
          <form onSubmit={submit}>
            <label>
              Description
              <input
                required
                maxLength="120"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Weekly groceries"
              />
            </label>
            <label>
              Amount (₹)
              <input
                required
                min="1"
                step="0.01"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
              />
            </label>
            <label>
              Category
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                {categories.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save transaction'}
            </button>
          </form>
          {editingId && (
            <button type="button" className={`link ${styles.cancel}`} onClick={resetForm}>
              Cancel edit
            </button>
          )}
          {message && <div className="notice">{message}</div>}
        </Panel>
      )}
      <Panel className="transaction-table">
        <div className="transaction-tools">
          <input value={q} onChange={(e) => setQuery(e.target.value)} placeholder="⌕  Filter by description..." />
          <select value={filters.categoryId} onChange={(e) => changeFilter({ categoryId: e.target.value })}>
            <option value="">All Categories</option>
            {categories.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          <button className="date-button" onClick={() => dateInput.current.showPicker()}>
            {filters.from ? filters.from.split('-').reverse().join(' / ') : 'dd / mm / yyyy'}&nbsp; ▣
          </button>
          <input
            ref={dateInput}
            type="date"
            tabIndex={-1}
            className={styles.pickerInput}
            value={filters.from}
            onChange={(e) => changeFilter({ from: e.target.value })}
          />
          <span />
          <button className="view-button">▤</button>
          <button className="view-button active">▦</button>
        </div>
        {items.length ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr key={x.id}>
                  <td>{formatDate(x.spentOn)}</td>
                  <td>
                    <b>{x.description}</b>
                    <small>{x.category}</small>
                  </td>
                  <td>
                    <span className="tag">{x.category}</span>
                  </td>
                  <td className="bad">
                    <b>− {money(x.amount)}</b>
                  </td>
                  <td>
                    <span className="expense-status">↓ Expense</span>
                  </td>
                  <td>
                    <button className="delete" onClick={() => edit(x)}>
                      Edit
                    </button>
                    <button className="delete" onClick={() => remove(x.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty>No matching transactions.</Empty>
        )}
        <div className="pagination">
          <span>
            Showing {items.length} of {total} entries
          </span>
          <div className={styles.pager}>
            <button disabled={page <= 1} onClick={() => dispatch({ type: 'pageChanged', page: page - 1 })}>
              Prev
            </button>
            <button className="active">{page}</button>
            <button disabled={page >= pages} onClick={() => dispatch({ type: 'pageChanged', page: page + 1 })}>
              Next
            </button>
          </div>
        </div>
      </Panel>
    </>
  );
}
