import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main key={pathname} className="flex-1 overflow-auto p-4 sm:p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
