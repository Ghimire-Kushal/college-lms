import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CalendarDays,
  ClipboardList, Bell, BarChart3, LogOut, FileText, BookMarked,
  Pencil, UserCheck, X, Video, CreditCard, Library, MessageSquare, TrendingUp,
} from 'lucide-react';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { section: 'Manage' },
  { to: '/admin/students',  label: 'Students',   icon: GraduationCap },
  { to: '/admin/teachers',  label: 'Teachers',   icon: Users },
  { to: '/admin/courses',   label: 'Courses',    icon: BookOpen },
  { section: 'Academic' },
  { to: '/admin/timetable',  label: 'Timetable',  icon: CalendarDays },
  { to: '/admin/attendance', label: 'Attendance', icon: UserCheck },
  { to: '/admin/notices',    label: 'Notices',    icon: Bell },
  { to: '/admin/results',    label: 'Results',    icon: BarChart3 },
  { to: '/admin/feedback',   label: 'Feedback',   icon: MessageSquare },
];

const teacherNav = [
  { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { section: 'Teaching' },
  { to: '/teacher/courses',        label: 'My Courses',    icon: BookOpen },
  { to: '/teacher/attendance',     label: 'Attendance',    icon: UserCheck },
  { to: '/teacher/notes',          label: 'Notes',         icon: FileText },
  { to: '/teacher/assignments',    label: 'Assignments',   icon: ClipboardList },
  { section: 'More' },
  { to: '/teacher/results',        label: 'Results',       icon: BarChart3 },
  { to: '/teacher/notices',        label: 'Notices',       icon: Bell },
  { to: '/teacher/online-classes', label: 'Online Classes',icon: Video },
];

const studentNav = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { section: 'Academics' },
  { to: '/student/courses',        label: 'My Courses',      icon: BookOpen },
  { to: '/student/timetable',      label: 'Class Routine',   icon: CalendarDays },
  { to: '/student/attendance',     label: 'Attendance',      icon: UserCheck },
  { to: '/student/notes',          label: 'Notes',           icon: BookMarked },
  { to: '/student/assignments',    label: 'Assignments',     icon: Pencil },
  { to: '/student/results',        label: 'Results',         icon: BarChart3 },
  { to: '/student/progress',       label: 'Progress',        icon: TrendingUp },
  { section: 'Campus' },
  { to: '/student/online-classes', label: 'Online Classes',  icon: Video },
  { to: '/student/library',        label: 'Library',         icon: Library },
  { to: '/student/fees',           label: 'Fee Details',     icon: CreditCard },
  { section: 'Info' },
  { to: '/student/notices',        label: 'Notices',         icon: Bell },
  { to: '/student/feedback',       label: 'Feedback',        icon: MessageSquare },
];

const navByRole = { admin: adminNav, teacher: teacherNav, student: studentNav };

const roleBadge = {
  admin:   'bg-blue-50 text-blue-700',
  teacher: 'bg-emerald-50 text-emerald-700',
  student: 'bg-slate-100 text-slate-600',
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navByRole[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      className={[
        'flex flex-col shrink-0 bg-white border-r border-slate-200 z-40',
        'fixed inset-y-0 left-0 transition-transform duration-200 lg:relative lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <img src="/logo.svg" alt="" className="w-5 h-5 object-contain brightness-0 invert" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-[13px] leading-tight truncate">Canvas Academy</p>
            <p className="text-[11px] text-slate-500 truncate">+2 College LMS</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
          <X size={16} />
        </button>
      </div>

      {/* Role badge */}
      <div className="px-4 py-2.5 border-b border-slate-100">
        <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded capitalize ${roleBadge[user?.role] || roleBadge.student}`}>
          {user?.role} Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {navItems.map((item, idx) => {
          if (item.section) {
            return (
              <p key={`s-${idx}`} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 pt-4 pb-1.5 first:pt-1">
                {item.section}
              </p>
            );
          }
          const { to, label, icon: Icon, end } = item;
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] mb-0.5 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} className={isActive ? 'text-white' : 'text-slate-400'} />
                  {label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-md">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0 overflow-hidden">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-slate-800 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
