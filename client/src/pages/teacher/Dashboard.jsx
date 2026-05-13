import { useState, useEffect } from 'react';
import { BookOpen, Users, ClipboardList, Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
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
      <Skeleton className="h-28" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64" /><Skeleton className="h-64" />
      </div>
      <Skeleton className="h-36" />
    </div>
  );

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#ede8e4';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2a0f0f 0%, #5a2020 55%, #8B3030 100%)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F2C04E 0%, transparent 70%)', opacity: 0.18 }} />
        <p className="text-[#F2C04E] text-xs font-semibold uppercase tracking-wider">Teacher Portal</p>
        <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Hello, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-white/50 text-sm mt-1">Manage your courses, attendance, and student progress.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="My Courses"        value={data?.totalCourses ?? 0}              icon={BookOpen}     color="maroon" gradient />
        <StatCard title="Total Students"    value={data?.totalStudents ?? 0}             icon={Users}        color="teal"   gradient />
        <StatCard title="Pending Reviews"   value={data?.pendingSubmissions ?? 0}        icon={ClipboardList} color="gold"  gradient />
        <StatCard title="Classes Recorded"  value={data?.recentAttendance?.length ?? 0} icon={Calendar}     color="green"  gradient />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Courses */}
        <div className="rounded-2xl p-5 sm:p-6 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold" style={{ color: headClr }}>My Courses</h2>
            <span className="text-xs font-medium" style={{ color: subClr }}>{data?.courses?.length || 0} active</span>
          </div>
          <div className="space-y-2.5">
            {!data?.courses?.length && (
              <div className="py-8 text-center" style={{ color: subClr }}>
                <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm opacity-50">No courses assigned</p>
              </div>
            )}
            {data?.courses?.map((c, i) => {
              const colors = ['#8B3030','#1E3535','#b87a00','#2a6648'];
              return (
                <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                  style={{ background: dark ? '#1a2828' : '#faf7f5', borderColor: border }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: colors[i % colors.length] }}>
                    {c.code?.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: headClr }}>{c.name}</p>
                    <p className="text-[11px]" style={{ color: subClr }}>{c.code}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{ background: dark ? '#1a1414' : '#f9e8e8', color: '#8B3030' }}>
                    {c.students?.length || 0} students
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="rounded-2xl p-5 sm:p-6 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold" style={{ color: headClr }}>Recent Assignments</h2>
            <span className="flex items-center gap-1 text-xs font-semibold cursor-pointer"
              style={{ color: '#8B3030' }}>View all <ArrowRight size={12} /></span>
          </div>
          <div className="space-y-2.5">
            {!data?.recentAssignments?.length && (
              <div className="py-8 text-center" style={{ color: subClr }}>
                <ClipboardList size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm opacity-50">No assignments yet</p>
              </div>
            )}
            {data?.recentAssignments?.map(a => {
              const overdue = new Date(a.dueDate) < new Date();
              return (
                <div key={a._id} className="flex items-start gap-3 p-3 rounded-xl border transition-colors"
                  style={{ background: dark ? '#1a2828' : '#faf7f5', borderColor: border }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: overdue ? (dark ? '#2a1414' : '#fde8e8') : (dark ? '#122828' : '#e8f5f0'), color: overdue ? '#e11d48' : '#1E3535' }}>
                    {overdue ? <Clock size={15} /> : <CheckCircle size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: headClr }}>{a.title}</p>
                    <p className="text-[11px]" style={{ color: subClr }}>{a.course?.name}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: overdue ? (dark ? '#2a1414' : '#fde8e8') : (dark ? '#122828' : '#e8f5f0'), color: overdue ? '#e11d48' : '#059669' }}>
                    {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="rounded-2xl p-5 sm:p-6 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
        <h2 className="text-[15px] font-semibold mb-4" style={{ color: headClr }}>Recent Attendance Records</h2>
        {!data?.recentAttendance?.length ? (
          <p className="text-sm" style={{ color: subClr }}>No attendance taken yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.recentAttendance.map(r => (
              <div key={r._id} className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: dark ? '#0f1e1e' : '#edf7f3', borderColor: dark ? '#1e3535' : '#c8e8dc' }}>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#1E3535' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: headClr }}>{r.course?.name}</p>
                  <p className="text-[11px]" style={{ color: subClr }}>
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
