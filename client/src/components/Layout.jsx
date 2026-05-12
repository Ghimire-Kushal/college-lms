import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen" style={{ background: '#f1f5f9' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main key={pathname} className="flex-1 p-6 overflow-auto page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
