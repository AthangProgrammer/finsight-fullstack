import { memo } from 'react';
import Panel from './Panel.jsx';

function Metric({ label, value, note, tone = 'blue' }) {
  return (
    <Panel className="metric">
      <div>
        <span>{label}</span>
        <i className={tone}>●</i>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </Panel>
  );
}

export default memo(Metric);
