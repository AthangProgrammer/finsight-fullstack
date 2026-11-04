import { useEffect, useRef, useState } from 'react';
import BudgetRing from '../components/BudgetRing.jsx';
import Empty from '../components/Empty.jsx';
import Heading from '../components/Heading.jsx';
import Metric from '../components/Metric.jsx';
import Panel from '../components/Panel.jsx';
import { useApi } from '../hooks/useApi.js';
import { useSummary } from '../hooks/useSummary.js';
import { lastMonths, MonthRange, monthLabel } from '../lib/months.js';
import { money, percent } from '../lib/money.js';

const color = ['c0', 'c1', 'c2', 'c3'];
const donutColors = ['#ff5964', '#9bbaff', '#7f91aa', '#2c3850'];

const donutBackground = (slice, total) => {
  if (!slice.length || !total) return '#26344c';
  let from = 0;
  const stops = slice.map((item, index) => {
    const to = from + (item.total / total) * 100;
    const stop = `${donutColors[index]} ${from}% ${to}%`;
    from = to;
    return stop;
  });
  if (from < 100) stops.push(`#26344c ${from}% 100%`);
  return `conic-gradient(${stops.join(',')})`;
};

export default function Analytics() {
  const request = useApi();
  const { summary, budget, setBudget, error } = useSummary();
  const { total, byCategory, series } = summary;
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const budgetInput = useRef(null);

  useEffect(() => setInput(budget || ''), [budget]);

  const saveBudget = async (event) => {
    event.preventDefault();
    try {
      const data = await request('/budget', { method: 'PUT', body: { monthlyAmount: Number(input || 0) } });
      setBudget(data.budget.monthlyAmount);
      setMessage('Monthly budget saved.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const slice = byCategory.slice(0, 4);
  const totals = new Map(series.map((point) => [point.month, point.total]));
  const keys = series.length ? [...new MonthRange(series[0].month, series.at(-1).month)] : [...lastMonths(6)];
  const peak = Math.max(...keys.map((key) => totals.get(key) ?? 0), 1);

  return (
    <>
      {error && <div className="notice error">{error}</div>}
      <Heading
        title="Budget & Analytics"
        subtitle="Track your spending and visualize your financial health."
        action={
          <div className="spending-alert">
            <b>⚠</b>
            <div>
              <strong>Spending Alert</strong>
              <span>Your spending is {budget && total > budget ? 'over budget' : 'on track'} this month.</span>
            </div>
          </div>
        }
      />
      <div className="budget-metrics">
        <Metric label="Total budget" value={money(budget)} note="Monthly allowance" />
        <Metric
          label="Total spent"
          value={money(total)}
          note={budget ? `${Math.round(percent(total, budget))}% of budget used` : 'Set a monthly budget'}
          tone="orange"
        />
        <Metric
          label="Remaining"
          value={money(budget - total)}
          note={budget >= total ? 'On track to save this month' : 'Budget exceeded'}
          tone="green"
        />
      </div>
      <div className="analytics-bento">
        <Panel className="category-card">
          <div className="panel-line">
            <h2>Category Budgets</h2>
            <button>•••</button>
          </div>
          {slice.length ? (
            slice.map((item, index) => {
              const cap = budget ? budget / slice.length : item.total;
              const pct = percent(item.total, cap);
              return (
                <div className="category" key={item.categoryId}>
                  <div>
                    <span>
                      <i className={color[index]} />
                      {item.category}
                    </span>
                    <b>
                      {money(item.total)} / {money(cap)}
                    </b>
                  </div>
                  <em>
                    <i className={color[index]} style={{ width: `${pct}%` }} />
                  </em>
                  <small className={pct >= 100 ? 'bad' : ''}>{pct >= 100 ? 'Over budget' : `${Math.round(pct)}% used`}</small>
                </div>
              );
            })
          ) : (
            <Empty>Add expenses to see categories.</Empty>
          )}
          <button className="outline-button" onClick={() => budgetInput.current?.focus()}>
            Set monthly budget
          </button>
        </Panel>
        <div className="charts">
          <Panel>
            <div className="panel-line">
              <h2>Monthly Spending Trend</h2>
              <span className="chart-tabs">
                6M&nbsp;&nbsp; <b>1Y</b>
              </span>
            </div>
            <div className="bar-chart">
              {keys.map((key, i) => (
                <div key={key}>
                  <i style={{ height: `${((totals.get(key) ?? 0) / peak) * 100}%` }} className={i === keys.length - 1 ? 'current' : ''} />
                  <span>{monthLabel(key)}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="donut-card">
            <div className="donut" style={{ background: donutBackground(slice, total) }}>
              <div>
                <small>Top Expense</small>
                <b>{slice[0]?.category || '—'}</b>
              </div>
            </div>
            <div className="donut-legend">
              {slice.map((item, index) => (
                <span key={item.categoryId}>
                  <i className={color[index]} />
                  {item.category}
                  <b>{Math.round(percent(item.total, total))}%</b>
                </span>
              ))}
            </div>
          </Panel>
        </div>
      </div>
      <Panel className="budget-save">
        <h2>Monthly budget</h2>
        <p>Set the amount you plan to spend this month.</p>
        <form onSubmit={saveBudget}>
          <label>
            Budget amount (₹)
            <input
              ref={budgetInput}
              className="budget-input"
              min="0"
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="50000"
            />
          </label>
          <button className="primary">Save budget</button>
        </form>
        {message && <div className="notice">{message}</div>}
      </Panel>
    </>
  );
}
