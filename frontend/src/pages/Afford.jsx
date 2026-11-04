import { useState } from 'react';
import Heading from '../components/Heading.jsx';
import Panel from '../components/Panel.jsx';
import { useSummary } from '../hooks/useSummary.js';
import { Expense } from '../lib/Expense.js';
import { money } from '../lib/money.js';

export default function Afford() {
  const { summary, budget } = useSummary();
  const [name, setName] = useState('Headphones');
  const [price, setPrice] = useState(8000);

  const purchase = new Expense({ description: name, amount: price });
  const remaining = budget - summary.total;
  const after = remaining - purchase.amount;
  const safe = after >= 0;

  return (
    <>
      <Heading title="Can I Afford This?" subtitle="Check if a planned purchase fits inside your remaining monthly budget." />
      <div className="two">
        <Panel>
          <h2>Purchase details</h2>
          <p>Test any expense before you spend.</p>
          <form>
            <label>
              Purchase name
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Purchase price (₹)
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </label>
          </form>
        </Panel>
        <Panel>
          <div className="status">
            <div>
              <small>ANALYSIS RESULT</small>
              <h2 className={safe ? 'safe' : 'bad'}>
                {budget === 0 ? 'SET A BUDGET FIRST' : safe ? 'YOU CAN AFFORD THIS' : 'CAUTION'}
              </h2>
            </div>
            <b>{safe ? '✓' : '!'}</b>
          </div>
          <div className="impact">
            <strong>{safe ? 'Looks manageable' : 'Impact warning'}</strong>
            <p>
              {budget === 0
                ? 'Set your monthly budget in Budget & Analytics to use this tool.'
                : safe
                  ? `Buying ${name} still leaves ${money(after)} in your monthly budget.`
                  : `This purchase would put you ${money(Math.abs(after))} over your monthly budget.`}
            </p>
          </div>
          <h3>Financial snapshot</h3>
          {[
            ['Monthly budget', budget],
            ['Expenses tracked', -summary.total],
            [`Purchase: ${name}`, -purchase.amount],
          ].map(([label, value]) => (
            <div className="snap" key={label}>
              <span>{label}</span>
              <b className={value < 0 ? 'bad' : ''}>
                {value < 0 ? '− ' : ''}
                {money(Math.abs(value))}
              </b>
            </div>
          ))}
          <div className="project">
            <span>Budget left after purchase</span>
            <b className={safe ? 'safe' : 'bad'}>{money(after)}</b>
          </div>
        </Panel>
      </div>
    </>
  );
}
