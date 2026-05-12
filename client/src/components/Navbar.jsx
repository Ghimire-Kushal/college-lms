import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, ChevronRight, Home } from 'lucide-react';

const routeMeta = {
  '/admin':             { label: 'Dashboard',         section: 'Admin' },
  '/admin/students':    { label: 'Students',           section: 'Admin' },
  '/admin/teachers':    { label: 'Teachers',           section: 'Admin' },
  '/admin/courses':     { label: 'Courses',            section: 'Admin' },
  '/admin/timetable':   { label: 'Timetable',          section: 'Admin' },
  '/admin/attendance':  { label: 'Attendance Reports', section: 'Admin' },
  '/admin/notices':     { label: 'Notices',            section: 'Admin' },
  '/admin/results':     { label: 'Results',            section: 'Admin' },
  '/teacher':           { label: 'Dashboard',          section: 'Teacher' },
  '/teacher/courses':   { label: 'My Courses',         section: 'Teacher' },
  '/teacher/attendance':{ label: 'Attendance',         section: 'Teacher' },
  '/teacher/notes':     { label: 'Notes & Materials',  section: 'Teacher' },
  '/teacher/assignments':{ label: 'Assignments',       section: 'Teacher' },
  '/teacher/results':   { label: 'Results',            section: 'Teacher' },
  '/teacher/notices':   { label: 'Notices',            section: 'Teacher' },
  '/student':           { label: 'Dashboard',          section: 'Student' },
  '/student/courses':   { label: 'My Courses',         section: 'Student' },
  '/student/attendance':{ label: 'My Attendance',      section: 'Student' },
  '/student/notes':     { label: 'Notes & Materials',  section: 'Student' },
  '/student/assignments':{ label: 'Assignments',       section: 'Student' },
  '/student/results':   { label: 'My Results',         section: 'Student' },
  '/student/notices':   { label: 'Notices',            section: 'Student' },
};

const roleColors = {
  admin:   'from-violet-500 to-purple-600',
  teacher: 'from-sky-500 to-blue-600',
  student: 'from-emerald-500 to-teal-600',
};

export default function Navbar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const meta = routeMeta[pathname] || { label: 'EduTrack LMS', section: '' };
  const avatarGradient = roleColors[user?.role] || roleColors.student;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header
      className="flex items-center justify-between px-6 bg-white border-b border-slate-100"
      style={{ height: 'var(--navbar-height)', minHeight: 'var(--navbar-height)' }}
    >
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Home size={14} className="text-slate-400" />
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-slate-400">{meta.section}</span>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="font-semibold text-slate-700">{meta.label}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Date chip */}
        <span className="hidden sm:flex items-center text-[12px] text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full font-medium">
          {today}
        </span>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-100" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-semibold text-slate-700 leading-none">{user?.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 capitalize">{user?.role}</p>
          </div>
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
