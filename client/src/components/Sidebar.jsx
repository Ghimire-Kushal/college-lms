import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CalendarDays,
  ClipboardList, Bell, BarChart3, LogOut, FileText, BookMarked,
  Pencil, UserCheck, ChevronRight, X,
} from 'lucide-react';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { section: 'Manage' },
  { to: '/admin/students', label: 'Students', icon: GraduationCap },
  { to: '/admin/teachers', label: 'Teachers', icon: Users },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { section: 'Academic' },
  { to: '/admin/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/admin/attendance', label: 'Attendance', icon: UserCheck },
  { to: '/admin/notices', label: 'Notices', icon: Bell },
  { to: '/admin/results', label: 'Results', icon: BarChart3 },
];

const teacherNav = [
  { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { section: 'Teaching' },
  { to: '/teacher/courses', label: 'My Courses', icon: BookOpen },
  { to: '/teacher/attendance', label: 'Attendance', icon: UserCheck },
  { to: '/teacher/notes', label: 'Notes & Materials', icon: FileText },
  { to: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
  { section: 'Communication' },
  { to: '/teacher/results', label: 'Results', icon: BarChart3 },
  { to: '/teacher/notices', label: 'Notices', icon: Bell },
];

const studentNav = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { section: 'Academics' },
  { to: '/student/courses', label: 'My Courses', icon: BookOpen },
  { to: '/student/attendance', label: 'Attendance', icon: UserCheck },
  { to: '/student/notes', label: 'Notes & Materials', icon: BookMarked },
  { to: '/student/assignments', label: 'Assignments', icon: Pencil },
  { to: '/student/results', label: 'Results', icon: BarChart3 },
  { section: 'Info' },
  { to: '/student/notices', label: 'Notices', icon: Bell },
];

const navByRole = { admin: adminNav, teacher: teacherNav, student: studentNav };

const roleColors = {
  admin:   { bg: 'bg-violet-500', ring: 'ring-violet-400', dot: 'bg-violet-400', label: 'bg-violet-500/15 text-violet-300' },
  teacher: { bg: 'bg-sky-500',    ring: 'ring-sky-400',    dot: 'bg-sky-400',    label: 'bg-sky-500/15 text-sky-300' },
  student: { bg: 'bg-emerald-500',ring: 'ring-emerald-400',dot: 'bg-emerald-400',label: 'bg-emerald-500/15 text-emerald-300' },
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const navItems = navByRole[user?.role] || [];
  const rc = roleColors[user?.role] || roleColors.student;

  const handleLogout = () => { logout(); navigate('/login'); };

  // Sidebar is always dark-ish; slightly different tones for light vs dark mode
  const sidebarBg = dark
    ? 'linear-gradient(180deg,#0d1117 0%,#0d1117 100%)'
    : 'linear-gradient(180deg,#0f172a 0%,#111827 100%)';
  const borderColor = dark ? 'rgba(48,54,61,0.7)' : 'rgba(255,255,255,0.06)';

  return (
    <aside
      className={[
        'flex flex-col shrink-0 z-40',
        'lg:relative lg:translate-x-0',
        'fixed inset-y-0 left-0 transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
      style={{
        width: 'var(--sidebar-width)',
        background: sidebarBg,
        borderRight: `1px solid ${borderColor}`,
      }}
    >
      {/* Brand */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-lg bg-white flex items-center justify-center">
            <img src="/logo.png" alt="Apollo" className="w-full h-full object-contain p-0.5" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-white text-[13px] leading-tight tracking-tight truncate">Apollo International</p>
            <p className="text-[10px] mt-0.5 font-semibold uppercase tracking-[0.12em] truncate"
              style={{ color: 'rgba(148,163,184,0.7)' }}>
              College · LMS
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${rc.label}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${rc.dot} pulse-dot`} />
          {user?.role} Panel
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <li key={`s-${idx}`} className="pt-4 pb-1.5 px-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.18em]" style={{ color: '#374151' }}>
                    {item.section}
                  </p>
                </li>
              );
            }
            const { to, label, icon: Icon, end } = item;
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'text-slate-400 hover:text-slate-200'
                    }`
                  }
                  style={({ isActive }) => isActive
                    ? { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }
                    : {}
                  }
                  onMouseEnter={e => { if (!e.currentTarget.className.includes('text-white')) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { if (!e.currentTarget.className.includes('text-white')) e.currentTarget.style.background = ''; }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                      <span className="flex-1">{label}</span>
                      {isActive && <ChevronRight size={13} style={{ color: 'rgba(255,255,255,0.6)' }} />}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className={`w-9 h-9 rounded-full ${rc.bg} ring-2 ${rc.ring} ring-offset-1 flex items-center justify-center text-white text-xs font-bold shrink-0`}
            style={{ ringOffsetColor: '#0f172a' }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-400 hover:text-red-400 font-medium transition-all"
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
