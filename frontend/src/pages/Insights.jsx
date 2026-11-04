import { useState } from 'react';
import Heading from '../components/Heading.jsx';
import Panel from '../components/Panel.jsx';
import { useApi } from '../hooks/useApi.js';

const suggestions = [
  'How can I stay within my budget?',
  'Which category should I reduce first?',
  'Give me a simple savings plan for this month.',
];

export default function Insights() {
  const request = useApi();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  const ask = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;
    setBusy(true);
    try {
      const data = await request('/insights', { method: 'POST', body: { question } });
      setAnswer(data.answer);
    } catch (err) {
      setAnswer(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Heading title="Your Financial Insights" subtitle="Ask for practical guidance based on your current spending." />
      <div className="two">
        <Panel className="ai">
          <i>✦</i>
          <h2>Ask your AI analyst</h2>
          <p>Get a short, useful perspective on your personal finances.</p>
          <form onSubmit={ask}>
            <textarea
              maxLength="300"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="How can I reduce my food spending this month?"
            />
            <button className="primary" disabled={busy}>
              {busy ? 'Thinking…' : 'Generate insight'}
            </button>
          </form>
          {answer && <div className="answer">{answer}</div>}
        </Panel>
        <Panel>
          <h2>Try asking</h2>
          {suggestions.map((x) => (
            <button className="suggest" key={x} onClick={() => setQuestion(x)}>
              {x}
              <span>→</span>
            </button>
          ))}
        </Panel>
      </div>
    </>
  );
}
