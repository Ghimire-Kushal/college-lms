import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CalendarDays,
  ClipboardList, Bell, BarChart3, LogOut, FileText, BookMarked,
  Pencil, UserCheck, ChevronRight, Sparkles,
} from 'lucide-react';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/students', label: 'Students', icon: GraduationCap },
  { to: '/admin/teachers', label: 'Teachers', icon: Users },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/admin/attendance', label: 'Attendance', icon: UserCheck },
  { to: '/admin/notices', label: 'Notices', icon: Bell },
  { to: '/admin/results', label: 'Results', icon: BarChart3 },
];

const teacherNav = [
  { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/teacher/courses', label: 'My Courses', icon: BookOpen },
  { to: '/teacher/attendance', label: 'Attendance', icon: UserCheck },
  { to: '/teacher/notes', label: 'Notes & Materials', icon: FileText },
  { to: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/teacher/results', label: 'Results', icon: BarChart3 },
  { to: '/teacher/notices', label: 'Notices', icon: Bell },
];

const studentNav = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/courses', label: 'My Courses', icon: BookOpen },
  { to: '/student/attendance', label: 'Attendance', icon: UserCheck },
  { to: '/student/notes', label: 'Notes & Materials', icon: BookMarked },
  { to: '/student/assignments', label: 'Assignments', icon: Pencil },
  { to: '/student/results', label: 'Results', icon: BarChart3 },
  { to: '/student/notices', label: 'Notices', icon: Bell },
];

const navByRole = { admin: adminNav, teacher: teacherNav, student: studentNav };

const roleColors = {
  admin:   { bg: 'bg-violet-500', ring: 'ring-violet-400', label: 'bg-violet-500/20 text-violet-300' },
  teacher: { bg: 'bg-sky-500',    ring: 'ring-sky-400',    label: 'bg-sky-500/20 text-sky-300' },
  student: { bg: 'bg-emerald-500', ring: 'ring-emerald-400', label: 'bg-emerald-500/20 text-emerald-300' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navByRole[user?.role] || [];
  const rc = roleColors[user?.role] || roleColors.student;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      className="flex flex-col shrink-0"
      style={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-[15px] leading-none tracking-tight">EduTrack</p>
            <p className="text-[11px] mt-0.5 font-medium uppercase tracking-widest"
              style={{ color: 'rgba(165,180,252,0.7)' }}>
              LMS Platform
            </p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-white/5">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${rc.label}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${rc.bg} pulse-dot`} />
          {user?.role} Panel
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 mb-2">Menu</p>
        <ul className="space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight size={14} className="text-indigo-300" />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-1">
          <div className={`w-8 h-8 rounded-full ${rc.bg} ring-2 ${rc.ring} ring-offset-1 ring-offset-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
