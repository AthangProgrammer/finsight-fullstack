import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { nav } from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function Shell() {
  const { pathname } = useLocation();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const label = nav.find(([to]) => to === pathname)?.[1] ?? 'Dashboard';
    document.title = `${label} | FinSight`;
  }, [pathname]);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  return (
    <main className="app">
      <Sidebar />
      <section className="work">
        <Topbar />
        <div className="canvas">
          {!online && <div className="notice error">You are offline. Changes will fail until you reconnect.</div>}
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
