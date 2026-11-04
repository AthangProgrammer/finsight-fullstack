import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const nav = [
  ['/', 'Dashboard', '⌂'],
  ['/transactions', 'Transactions', '▤'],
  ['/analytics', 'Budget & Analytics', '◔'],
  ['/insights', 'AI Insights', '✦'],
  ['/afford', 'Can I Afford This?', '⌁'],
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside>
      <div className="brand">
        <b>◉</b>
        <span>FinSight</span>
      </div>
      <nav>
        {nav.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? 'active' : '')}>
            <i>{icon}</i>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="profile">
        <b>{user.username[0].toUpperCase()}</b>
        <div>
          <strong>{user.username}</strong>
          <small>Personal workspace</small>
        </div>
        <button onClick={logout}>↪</button>
      </div>
    </aside>
  );
}
