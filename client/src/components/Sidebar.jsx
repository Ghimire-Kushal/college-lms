import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CalendarDays,
  ClipboardList, Bell, BarChart3, LogOut, FileText, BookMarked,
  Pencil, UserCheck, X, Video, CreditCard,
  Library, MessageSquare, TrendingUp,
} from 'lucide-react';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { section: 'Management' },
  { to: '/admin/students', label: 'Students', icon: GraduationCap },
  { to: '/admin/teachers', label: 'Teachers', icon: Users },
  { to: '/admin/courses',  label: 'Courses',  icon: BookOpen },
  { section: 'Academics' },
  { to: '/admin/attendance',   label: 'Attendance',   icon: UserCheck },
  { to: '/admin/assignments',  label: 'Assignments',  icon: ClipboardList },
  { to: '/admin/results',      label: 'Results',      icon: BarChart3 },
  { to: '/admin/timetable',    label: 'Timetable',    icon: CalendarDays },
  { section: 'Communication' },
  { to: '/admin/notices',   label: 'Notices',  icon: Bell },
  { to: '/admin/feedback',  label: 'Feedback', icon: MessageSquare },
];

const teacherNav = [
  { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { section: 'Teaching' },
  { to: '/teacher/courses',    label: 'My Courses',      icon: BookOpen },
  { to: '/teacher/attendance', label: 'Attendance',      icon: UserCheck },
  { to: '/teacher/notes',      label: 'Notes & Materials', icon: FileText },
  { to: '/teacher/assignments', label: 'Assignments',    icon: ClipboardList },
  { section: 'Communication' },
  { to: '/teacher/results',       label: 'Results',       icon: BarChart3 },
  { to: '/teacher/notices',       label: 'Notices',       icon: Bell },
  { to: '/teacher/online-classes', label: 'Online Classes', icon: Video },
];

const studentNav = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { section: 'Academics' },
  { to: '/student/courses',    label: 'My Courses',       icon: BookOpen },
  { to: '/student/timetable',  label: 'Class Routine',    icon: CalendarDays },
  { to: '/student/attendance', label: 'Attendance',       icon: UserCheck },
  { to: '/student/notes',      label: 'Notes & Materials', icon: BookMarked },
  { to: '/student/assignments', label: 'Assignments',     icon: Pencil },
  { to: '/student/results',    label: 'Results',          icon: BarChart3 },
  { to: '/student/progress',   label: 'Academic Progress', icon: TrendingUp },
  { section: 'Campus' },
  { to: '/student/online-classes', label: 'Online Classes', icon: Video },
  { to: '/student/library',    label: 'Library',          icon: Library },
  { to: '/student/fees',       label: 'Fee Details',      icon: CreditCard },
  { section: 'Communication' },
  { to: '/student/notices',    label: 'Notices',   icon: Bell },
  { to: '/student/feedback',   label: 'Feedback',  icon: MessageSquare },
];

const navByRole = { admin: adminNav, teacher: teacherNav, student: studentNav };

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const navItems = navByRole[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  const bg     = dark ? '#0f172a' : '#ffffff';
  const border = dark ? '#1e293b' : '#e5e7eb';
  const textMuted  = dark ? '#64748b' : '#9ca3af';
  const textNormal = dark ? '#94a3b8' : '#6b7280';

  return (
    <aside
      className={[
        'flex flex-col shrink-0 z-40',
        'lg:relative lg:translate-x-0',
        'fixed inset-y-0 left-0 transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
      style={{ width: 'var(--sidebar-width)', background: bg, borderRight: `1px solid ${border}` }}
    >
      {/* Brand */}
      <div
        className="px-4 h-[var(--navbar-height)] flex items-center justify-between shrink-0"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
            style={{ background: dark ? '#1e293b' : '#f9fafb', border: `1px solid ${border}` }}>
            <img src="/logo.svg" alt="Apollo" className="w-full h-full object-contain p-0.5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[13px] leading-tight truncate"
              style={{ color: dark ? '#f1f5f9' : '#111827' }}>
              Apollo International
            </p>
            <p className="text-[11px] truncate" style={{ color: textMuted }}>
              College · LMS
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden w-7 h-7 flex items-center justify-center rounded-md transition-colors"
          style={{ color: textNormal }}
          onMouseEnter={e => { e.currentTarget.style.background = dark ? '#1e293b' : '#f9fafb'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <li key={`s-${idx}`} className="px-2 pt-4 pb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
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
                    `group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-100 ${
                      isActive ? '' : ''
                    }`
                  }
                  style={({ isActive }) => isActive
                    ? {
                        background: dark ? '#1e293b' : '#f3f4f6',
                        color:      dark ? '#f1f5f9' : '#111827',
                      }
                    : {
                        color: textNormal,
                      }
                  }
                  onMouseEnter={e => {
                    if (!e.currentTarget.style.background) {
                      e.currentTarget.style.background = dark ? '#1e293b' : '#f9fafb';
                    }
                  }}
                  onMouseLeave={e => {
                    if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                      e.currentTarget.style.background = '';
                    }
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={15}
                        style={{ color: isActive ? (dark ? '#f1f5f9' : '#111827') : textMuted }}
                      />
                      <span className="flex-1 truncate">{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 shrink-0" style={{ borderTop: `1px solid ${border}` }}>
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1"
          style={{ background: dark ? '#1e293b' : '#f9fafb' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-semibold shrink-0 overflow-hidden"
            style={{ background: '#111827' }}
          >
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: dark ? '#f1f5f9' : '#111827' }}>
              {user?.name}
            </p>
            <p className="text-[11px] capitalize truncate" style={{ color: textMuted }}>
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
          style={{ color: textNormal }}
          onMouseEnter={e => { e.currentTarget.style.background = dark ? '#450a0a' : '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textNormal; }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
