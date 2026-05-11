import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';

const titles = {
  '/admin': 'Dashboard', '/admin/students': 'Students', '/admin/teachers': 'Teachers',
  '/admin/courses': 'Courses', '/admin/timetable': 'Timetable', '/admin/attendance': 'Attendance Reports',
  '/admin/notices': 'Notices', '/admin/results': 'Results',
  '/teacher': 'Dashboard', '/teacher/courses': 'My Courses', '/teacher/attendance': 'Attendance',
  '/teacher/notes': 'Notes & Materials', '/teacher/assignments': 'Assignments',
  '/teacher/results': 'Results', '/teacher/notices': 'Notices',
  '/student': 'Dashboard', '/student/courses': 'My Courses', '/student/attendance': 'My Attendance',
  '/student/notes': 'Notes & Materials', '/student/assignments': 'Assignments',
  '/student/results': 'My Results', '/student/notices': 'Notices',
};

export default function Navbar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const title = titles[pathname] || 'EduTrack LMS';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Welcome, <span className="font-medium text-gray-700">{user?.name}</span></span>
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
