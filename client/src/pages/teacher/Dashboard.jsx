import { useState, useEffect } from 'react';
import { BookOpen, Users, ClipboardList, Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/teacher/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-32" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2a0f0f 0%, #5a2020 60%, #8B3030 100%)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F2C04E, transparent)' }} />
        <p className="text-[#F2C04E] text-sm font-medium">Teacher Portal</p>
        <h2 className="text-white text-2xl font-bold mt-0.5">Hello, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-white/50 text-sm mt-1">Manage your courses, attendance, and student progress.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard title="My Courses"        value={data?.totalCourses ?? 0}            icon={BookOpen}     color="maroon" gradient />
        <StatCard title="Total Students"    value={data?.totalStudents ?? 0}           icon={Users}        color="teal"   gradient />
        <StatCard title="Pending Reviews"   value={data?.pendingSubmissions ?? 0}      icon={ClipboardList} color="gold"  gradient />
        <StatCard title="Classes Recorded"  value={data?.recentAttendance?.length ?? 0} icon={Calendar}    color="green"  gradient />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-slate-800">My Courses</h2>
            <span className="text-xs text-slate-400">{data?.courses?.length || 0} active</span>
          </div>
          <div className="space-y-3">
            {data?.courses?.length === 0 && (
              <div className="py-6 text-center text-slate-300">
                <BookOpen size={28} className="mx-auto mb-2" />
                <p className="text-sm">No courses assigned</p>
              </div>
            )}
            {data?.courses?.map((c, i) => (
              <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-sky-100 hover:bg-sky-50/30 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: `hsl(${(i * 60 + 200) % 360}, 65%, 55%)` }}>
                  {c.code?.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-700 truncate">{c.name}</p>
                  <p className="text-[11px] text-slate-400">{c.code}</p>
                </div>
                <span className="shrink-0 text-[11px] bg-sky-50 text-sky-600 font-medium px-2.5 py-1 rounded-full border border-sky-100">
                  {c.students?.length || 0} students
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-slate-800">Recent Assignments</h2>
            <span className="flex items-center gap-1 text-xs text-indigo-600 font-medium cursor-pointer hover:underline">
              View all <ArrowRight size={12} />
            </span>
          </div>
          <div className="space-y-3">
            {data?.recentAssignments?.length === 0 && (
              <div className="py-6 text-center text-slate-300">
                <ClipboardList size={28} className="mx-auto mb-2" />
                <p className="text-sm">No assignments yet</p>
              </div>
            )}
            {data?.recentAssignments?.map(a => {
              const isOverdue = new Date(a.dueDate) < new Date();
              return (
                <div key={a._id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {isOverdue ? <Clock size={15} /> : <CheckCircle size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700 truncate">{a.title}</p>
                    <p className="text-[11px] text-slate-400">{a.course?.name}</p>
                  </div>
                  <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-[15px] font-semibold text-slate-800 mb-4">Recent Attendance Records</h2>
        {data?.recentAttendance?.length === 0 ? (
          <p className="text-slate-400 text-sm">No attendance taken yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data?.recentAttendance?.map(r => (
              <div key={r._id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-700 truncate">{r.course?.name}</p>
                  <p className="text-[11px] text-slate-400">
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
