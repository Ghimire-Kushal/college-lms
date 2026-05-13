import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, ChevronRight, Home, Menu, Sun, Moon } from 'lucide-react';

const routeMeta = {
  '/admin':              { label: 'Dashboard',         section: 'Admin' },
  '/admin/students':     { label: 'Students',           section: 'Admin' },
  '/admin/teachers':     { label: 'Teachers',           section: 'Admin' },
  '/admin/courses':      { label: 'Courses',            section: 'Admin' },
  '/admin/timetable':    { label: 'Timetable',          section: 'Admin' },
  '/admin/attendance':   { label: 'Attendance Reports', section: 'Admin' },
  '/admin/notices':      { label: 'Notices',            section: 'Admin' },
  '/admin/results':      { label: 'Results',            section: 'Admin' },
  '/teacher':            { label: 'Dashboard',          section: 'Teacher' },
  '/teacher/courses':    { label: 'My Courses',         section: 'Teacher' },
  '/teacher/attendance': { label: 'Attendance',         section: 'Teacher' },
  '/teacher/notes':      { label: 'Notes & Materials',  section: 'Teacher' },
  '/teacher/assignments':{ label: 'Assignments',        section: 'Teacher' },
  '/teacher/results':    { label: 'Results',            section: 'Teacher' },
  '/teacher/notices':    { label: 'Notices',            section: 'Teacher' },
  '/student':            { label: 'Dashboard',          section: 'Student' },
  '/student/courses':    { label: 'My Courses',         section: 'Student' },
  '/student/attendance': { label: 'My Attendance',      section: 'Student' },
  '/student/notes':      { label: 'Notes & Materials',  section: 'Student' },
  '/student/assignments':{ label: 'Assignments',        section: 'Student' },
  '/student/results':    { label: 'My Results',         section: 'Student' },
  '/student/notices':    { label: 'Notices',            section: 'Student' },
};

const roleColors = {
  admin:   'from-violet-500 to-purple-600',
  teacher: 'from-sky-500 to-blue-600',
  student: 'from-emerald-500 to-teal-600',
};

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth();
  const { dark, toggle } = useTheme();
  const { pathname } = useLocation();
  const meta = routeMeta[pathname] || { label: 'Apollo International College', section: '' };
  const avatarGradient = roleColors[user?.role] || roleColors.student;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 gap-3 border-b transition-colors duration-300"
      style={{
        height: 'var(--navbar-height)',
        minHeight: 'var(--navbar-height)',
        background: dark ? '#161b22' : '#ffffff',
        borderColor: dark ? '#21262d' : '#e8edf3',
        boxShadow: dark
          ? '0 1px 0 #21262d'
          : '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
          style={{ color: dark ? '#8b949e' : '#64748b' }}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-sm min-w-0">
          <Home size={13} style={{ color: dark ? '#6e7681' : '#94a3b8' }} className="shrink-0" />
          <ChevronRight size={11} style={{ color: dark ? '#484f58' : '#cbd5e1' }} className="shrink-0" />
          <span className="hidden md:inline shrink-0" style={{ color: dark ? '#6e7681' : '#94a3b8' }}>{meta.section}</span>
          <ChevronRight size={11} style={{ color: dark ? '#484f58' : '#cbd5e1' }} className="shrink-0 hidden md:inline" />
          <span className="font-semibold truncate" style={{ color: dark ? '#c9d1d9' : '#334155' }}>{meta.label}</span>
        </div>

        {/* Mobile page title */}
        <span className="sm:hidden font-bold text-[15px] truncate" style={{ color: dark ? '#e2e8f0' : '#1e293b' }}>
          {meta.label}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Date chip */}
        <span
          className="hidden md:flex items-center text-[12px] px-3 py-1.5 rounded-full font-medium whitespace-nowrap"
          style={{
            background: dark ? '#21262d' : '#f0f4f8',
            color: dark ? '#8b949e' : '#64748b',
            border: `1px solid ${dark ? '#30363d' : '#e2e8f0'}`,
          }}
        >
          {today}
        </span>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: dark ? '#21262d' : '#f0f4f8',
            border: `1px solid ${dark ? '#30363d' : '#e2e8f0'}`,
            color: dark ? '#f0ab3d' : '#64748b',
          }}
          title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: dark ? '#21262d' : '#f0f4f8',
            border: `1px solid ${dark ? '#30363d' : '#e2e8f0'}`,
            color: dark ? '#8b949e' : '#64748b',
          }}
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2"
            style={{ ringColor: dark ? '#161b22' : '#ffffff' }} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 hidden sm:block" style={{ background: dark ? '#21262d' : '#e2e8f0' }} />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-semibold leading-none" style={{ color: dark ? '#c9d1d9' : '#1e293b' }}>
              {user?.name}
            </p>
            <p className="text-[11px] mt-0.5 capitalize" style={{ color: dark ? '#6e7681' : '#94a3b8' }}>
              {user?.role}
            </p>
          </div>
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
