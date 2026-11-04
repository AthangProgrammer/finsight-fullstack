import { useNavigate } from 'react-router-dom';
import BudgetRing from '../components/BudgetRing.jsx';
import Empty from '../components/Empty.jsx';
import Heading from '../components/Heading.jsx';
import Metric from '../components/Metric.jsx';
import Panel from '../components/Panel.jsx';
import { useSummary } from '../hooks/useSummary.js';
import { formatDate, money, percent } from '../lib/money.js';

const color = ['c0', 'c1', 'c2', 'c3'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { summary, budget, recent, recentTotal, error } = useSummary();
  const { total, byCategory } = summary;
  const remaining = budget - total;

  return (
    <>
      {error && <div className="notice error">{error}</div>}
      <Heading
        title="Overview"
        subtitle="A clear view of your spending and monthly budget."
        action={
          <button className="primary" onClick={() => navigate('/transactions')}>
            + Add expense
          </button>
        }
      />
      <div className="metrics">
        <Metric label="Monthly budget" value={money(budget)} note="Set this in Budget & Analytics" />
        <Metric label="Total spent" value={money(total)} note={`${recentTotal} tracked expenses`} tone="orange" />
        <Metric
          label="Remaining"
          value={money(remaining)}
          note={remaining >= 0 ? 'Still available this month' : 'You are over budget'}
          tone={remaining >= 0 ? 'green' : 'purple'}
        />
        <Metric
          label="Top category"
          value={byCategory[0]?.category || '—'}
          note={byCategory[0] ? money(byCategory[0].total) : 'No expenses yet'}
          tone="purple"
        />
      </div>
      <div className="grid">
        <Panel>
          <h2>Budget progress</h2>
          <p>Your monthly spending against the budget.</p>
          <BudgetRing percent={percent(total, budget)} hasBudget={budget > 0} />
          <div className="progress big">
            <i className="c0" style={{ width: `${percent(total, budget)}%` }} />
          </div>
          <div className="progress-label">
            <span>{money(total)} spent</span>
            <span>{money(Math.max(0, remaining))} remaining</span>
          </div>
        </Panel>
        <Panel>
          <h2>Spending by category</h2>
          <p>Your biggest areas of spending.</p>
          {byCategory.length ? (
            byCategory.slice(0, 4).map((item, index) => (
              <div className="category" key={item.categoryId}>
                <div>
                  <span>
                    <i className={color[index]} />
                    {item.category}
                  </span>
                  <b>{money(item.total)}</b>
                </div>
                <em>
                  <i className={color[index]} style={{ width: `${percent(item.total, total)}%` }} />
                </em>
                <small>{Math.round(percent(item.total, total))}% of spending</small>
              </div>
            ))
          ) : (
            <Empty>Add expenses to see category data.</Empty>
          )}
        </Panel>
        <Panel className="recent">
          <h2>Recent transactions</h2>
          <p>Your latest personal expenses.</p>
          {recent.length ? (
            recent.map((item, index) => (
              <div className="row" key={item.id}>
                <b className={color[index % 4]}>{item.category[0]}</b>
                <span>
                  <strong>{item.description}</strong>
                  <small>
                    {item.category} · {formatDate(item.spentOn)}
                  </small>
                </span>
                <em className="bad">− {money(item.amount)}</em>
              </div>
            ))
          ) : (
            <Empty>No expenses recorded.</Empty>
          )}
        </Panel>
      </div>
    </>
  );
}
