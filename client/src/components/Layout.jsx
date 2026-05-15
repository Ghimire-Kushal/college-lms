import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Settings2 } from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Customizer from './Customizer';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const { pathname } = useLocation();
  const { dark, headerType, contentWidth } = useTheme();

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setSidebarOpen(false); setCustomizerOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex min-h-screen transition-colors duration-300 overflow-x-hidden"
      style={{ background: dark ? '#0d1212' : '#f0ebe8' }}>

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
        <Navbar
          onMenuToggle={() => setSidebarOpen(o => !o)}
          headerType={headerType}
        />
        <main
          key={pathname}
          className={`flex-1 overflow-auto overflow-x-hidden page-enter ${
            contentWidth === 'compact' ? 'p-4 sm:p-5' : 'p-4 sm:p-6'
          }`}
        >
          {contentWidth === 'compact'
            ? <div className="max-w-5xl mx-auto"><Outlet /></div>
            : <Outlet />
          }
        </main>
      </div>

      {/* Customizer floating trigger */}
      <button
        onClick={() => setCustomizerOpen(o => !o)}
        title="Template Customizer"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center rounded-l-xl shadow-lg transition-all hover:pr-1"
        style={{
          width: 36,
          height: 36,
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: '#fff',
        }}
      >
        <Settings2 size={16} />
      </button>

      <Customizer isOpen={customizerOpen} onClose={() => setCustomizerOpen(false)} />
    </div>
  );
}
