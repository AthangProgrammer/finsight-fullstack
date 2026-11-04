import styled from 'styled-components';

const Ring = styled.div`
  && {
    position: relative;
    border-color: transparent;
  }
  &&::before {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: conic-gradient(#75a7ff ${(props) => props.$percent}%, #34435c 0);
    mask: radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 8px));
  }
  && > * {
    position: relative;
  }
`;

export default function BudgetRing({ percent, hasBudget }) {
  return (
    <Ring className="budget-ring" $percent={percent}>
      <b>{hasBudget ? `${Math.round(percent)}%` : '—'}</b>
      <span>used</span>
    </Ring>
  );
}
