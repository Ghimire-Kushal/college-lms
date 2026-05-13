import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { dark } = useTheme();

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex min-h-screen transition-colors duration-300"
      style={{ background: dark ? '#0d1117' : '#eef2f7' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main
          key={pathname}
          className="flex-1 p-5 sm:p-7 overflow-auto page-enter"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
