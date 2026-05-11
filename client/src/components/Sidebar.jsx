import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CalendarDays,
  ClipboardList, Bell, BarChart3, LogOut, ChevronRight,
  FileText, BookMarked, Pencil, UserCheck,
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

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-indigo-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-indigo-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-lg">E</div>
          <div>
            <p className="font-bold text-lg leading-none">EduTrack</p>
            <p className="text-indigo-300 text-xs capitalize">{user?.role} Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-indigo-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-indigo-300 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-indigo-200 hover:bg-indigo-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
