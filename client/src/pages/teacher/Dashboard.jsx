import { useState, useEffect } from 'react';
import { BookOpen, Users, ClipboardList, Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const COURSE_COLORS = ['#111827', '#2563eb', '#16a34a', '#7c3aed', '#ca8a04', '#dc2626'];

function Skeleton({ className = '' }) {
  const { dark } = useTheme();
  return (
    <div className={`rounded-xl ${className}`}
      style={{ background: dark ? '#1e293b' : '#f3f4f6', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
  );
}

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { dark } = useTheme();

  useEffect(() => {
    api.get('/teacher/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64" /><Skeleton className="h-64" />
      </div>
      <Skeleton className="h-36" />
    </div>
  );

  const surface = dark ? '#1e293b' : '#ffffff';
  const border  = dark ? '#334155' : '#e5e7eb';
  const textHead = dark ? '#f1f5f9' : '#111827';
  const textSub  = dark ? '#94a3b8' : '#6b7280';

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Courses"       value={data?.totalCourses ?? 0}              icon={BookOpen}      color="primary" />
        <StatCard title="Total Students"   value={data?.totalStudents ?? 0}             icon={Users}         color="blue" />
        <StatCard title="Pending Reviews"  value={data?.pendingSubmissions ?? 0}        icon={ClipboardList} color="yellow" />
        <StatCard title="Classes Recorded" value={data?.recentAttendance?.length ?? 0} icon={Calendar}      color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Courses */}
        <div className="rounded-xl border p-5" style={{ background: surface, borderColor: border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold" style={{ color: textHead }}>My Courses</h3>
            <span className="text-[12px]" style={{ color: textSub }}>{data?.courses?.length || 0} active</span>
          </div>
          <div className="space-y-2">
            {!data?.courses?.length ? (
              <div className="py-8 text-center">
                <BookOpen size={24} className="mx-auto mb-2" style={{ color: dark ? '#334155' : '#e5e7eb' }} />
                <p className="text-[13px]" style={{ color: textSub }}>No courses assigned</p>
              </div>
            ) : data.courses.map((c, i) => (
              <div key={c._id} className="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                style={{ borderColor: border }}
                onMouseEnter={e => { e.currentTarget.style.background = dark ? '#0f172a' : '#f9fafb'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                  style={{ background: COURSE_COLORS[i % COURSE_COLORS.length] }}>
                  {c.code?.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: textHead }}>{c.name}</p>
                  <p className="text-[11px]" style={{ color: textSub }}>{c.code}</p>
                </div>
                <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-md"
                  style={{ background: dark ? '#0f172a' : '#f3f4f6', color: textSub }}>
                  {c.students?.length || 0} students
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="rounded-xl border p-5" style={{ background: surface, borderColor: border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold" style={{ color: textHead }}>Recent Assignments</h3>
            <span className="flex items-center gap-1 text-[12px] cursor-pointer transition-opacity hover:opacity-70"
              style={{ color: textSub }}>View all <ArrowRight size={12} /></span>
          </div>
          <div className="space-y-2">
            {!data?.recentAssignments?.length ? (
              <div className="py-8 text-center">
                <ClipboardList size={24} className="mx-auto mb-2" style={{ color: dark ? '#334155' : '#e5e7eb' }} />
                <p className="text-[13px]" style={{ color: textSub }}>No assignments yet</p>
              </div>
            ) : data.recentAssignments.map(a => {
              const overdue = new Date(a.dueDate) < new Date();
              return (
                <div key={a._id} className="flex items-center gap-3 p-3 rounded-lg border transition-colors"
                  style={{
                    borderColor: overdue ? '#fecaca' : border,
                    background: overdue ? (dark ? '#450a0a22' : '#fef2f2') : 'transparent',
                  }}
                >
                  <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: overdue ? (dark ? '#450a0a' : '#fef2f2') : (dark ? '#0f172a' : '#f3f4f6') }}>
                    {overdue
                      ? <Clock size={13} style={{ color: '#dc2626' }} />
                      : <CheckCircle size={13} style={{ color: '#16a34a' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: textHead }}>{a.title}</p>
                    <p className="text-[11px]" style={{ color: textSub }}>{a.course?.name}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-md"
                    style={{ background: dark ? '#0f172a' : '#f3f4f6', color: overdue ? '#dc2626' : '#16a34a' }}>
                    {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="rounded-xl border p-5" style={{ background: surface, borderColor: border }}>
        <h3 className="text-[14px] font-semibold mb-4" style={{ color: textHead }}>Recent Attendance Records</h3>
        {!data?.recentAttendance?.length ? (
          <p className="text-[13px]" style={{ color: textSub }}>No attendance taken yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {data.recentAttendance.map(r => (
              <div key={r._id} className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ borderColor: border }}
                onMouseEnter={e => { e.currentTarget.style.background = dark ? '#0f172a' : '#f9fafb'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#10b981' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: textHead }}>{r.course?.name}</p>
                  <p className="text-[11px]" style={{ color: textSub }}>
                    {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
