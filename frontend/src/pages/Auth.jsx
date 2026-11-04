import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Panel from '../components/Panel.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validatePassword, validateUsername } from '../lib/validate.js';

export default function Auth({ mode }) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(location.state?.message ?? '');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={location.state?.from?.pathname ?? '/'} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    if (mode === 'register') {
      const invalid = validateUsername(username) || validatePassword(password);
      if (invalid) return setMessage(invalid);
    }
    setBusy(true);
    try {
      if (mode === 'register') {
        await register(username, password);
        navigate('/login', { replace: true, state: { message: 'Account created. Please sign in.' } });
      } else {
        await login(username, password);
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => navigate(mode === 'login' ? '/register' : '/login', { state: location.state });

  return (
    <main className="auth">
      <Panel>
        <div className="brand">
          <b>◉</b>
          <span>FinSight</span>
        </div>
        <h1>{mode === 'login' ? 'Your spending, in focus.' : 'Start tracking smarter.'}</h1>
        <p>Your private personal expense tracker.</p>
        <form onSubmit={submit}>
          <label>
            Username
            <input required value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label>
            Password
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button type="submit" className="primary" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        {message && <div className="notice">{message}</div>}
        <button type="button" className="link" onClick={switchMode}>
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>
      </Panel>
    </main>
  );
}
