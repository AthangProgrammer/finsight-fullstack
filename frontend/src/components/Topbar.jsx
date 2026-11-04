import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toggleTheme } from '../lib/theme.js';

export default function Topbar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const input = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      if (event.key.toLowerCase() === 'k') {
        event.preventDefault();
        input.current?.focus();
      } else if (event.shiftKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const search = (event) => {
    const q = event.target.value;
    navigate(q ? `/transactions?q=${encodeURIComponent(q)}` : '/transactions', { replace: true });
  };

  return (
    <header>
      <div className="search">
        ⌕ <input ref={input} value={params.get('q') ?? ''} onChange={search} placeholder="Search expenses, insights..." />
      </div>
      <button onClick={() => navigate('/transactions')}>+ Add expense</button>
    </header>
  );
}
