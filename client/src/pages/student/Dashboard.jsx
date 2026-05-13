import { useState, useEffect } from 'react';
import { BookOpen, UserCheck, ClipboardList, Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

function AttendanceRing({ pct }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-slate-800">{pct}%</span>
        <span className="text-[9px] text-slate-400 uppercase tracking-wide">Attend.</span>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/student/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-32" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );

  const attPct = parseFloat(data?.attendancePercentage || 0);
  const isLowAtt = attPct < 75;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1c1c 0%, #1a2e2e 60%, #1e3535 100%)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F2C04E, transparent)' }} />
        <p className="text-[#F2C04E] text-sm font-medium">Student Portal</p>
        <h2 className="text-white text-2xl font-bold mt-0.5">Hi, {user?.name?.split(' ')[0]}! 🎓</h2>
        <p className="text-white/50 text-sm mt-1">Keep up the great work and stay on top of your studies.</p>
      </div>

      {/* Attendance warning */}
      {isLowAtt && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
          <AlertTriangle size={18} className="shrink-0 text-rose-500" />
          <div>
            <p className="text-sm font-semibold">Attendance Warning</p>
            <p className="text-xs text-rose-500">Your attendance is {attPct}% — below the required 75%. Please attend more classes.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard title="Enrolled Courses"    value={data?.totalCourses ?? 0}             icon={BookOpen}     color="maroon" gradient />
        <StatCard title="Attendance Rate"     value={`${attPct}%`}                        icon={UserCheck}    color={isLowAtt ? 'red' : 'teal'} gradient />
        <StatCard title="Classes Attended"    value={`${data?.presentClasses ?? 0}/${data?.totalClasses ?? 0}`} icon={UserCheck} color="green" gradient />
        <StatCard title="Due Assignments"     value={data?.upcomingAssignments?.length ?? 0} icon={ClipboardList} color="gold" gradient />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Attendance ring */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center">
          <h2 className="text-[15px] font-semibold text-slate-800 mb-4">Attendance Summary</h2>
          <AttendanceRing pct={attPct} />
          <div className="mt-4 flex gap-6 text-center">
            <div>
              <p className="text-xl font-bold text-emerald-600">{data?.presentClasses ?? 0}</p>
              <p className="text-[11px] text-slate-400">Present</p>
            </div>
            <div>
              <p className="text-xl font-bold text-rose-500">{(data?.totalClasses ?? 0) - (data?.presentClasses ?? 0)}</p>
              <p className="text-[11px] text-slate-400">Absent</p>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-600">{data?.totalClasses ?? 0}</p>
              <p className="text-[11px] text-slate-400">Total</p>
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-slate-800">Upcoming Assignments</h2>
            <span className="text-xs text-slate-400">{data?.upcomingAssignments?.length || 0} pending</span>
          </div>
          <div className="space-y-3">
            {data?.upcomingAssignments?.length === 0 && (
              <div className="py-6 text-center text-slate-300">
                <CheckCircle size={28} className="mx-auto mb-2 text-emerald-300" />
                <p className="text-sm">All caught up!</p>
              </div>
            )}
            {data?.upcomingAssignments?.map(a => {
              const daysLeft = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              const urgent = daysLeft <= 2;
              return (
                <div key={a._id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${urgent ? 'border-rose-100 bg-rose-50/40' : 'border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/20'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${urgent ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-600'}`}>
                    {urgent ? <Clock size={15} /> : <ClipboardList size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700 truncate">{a.title}</p>
                    <p className="text-[11px] text-slate-400">{a.course?.name}</p>
                  </div>
                  <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${urgent ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                    {daysLeft}d left
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* My Courses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-[15px] font-semibold text-slate-800 mb-4">My Courses</h2>
          <div className="space-y-2.5">
            {data?.courses?.length === 0 && <p className="text-slate-400 text-sm">No courses enrolled</p>}
            {data?.courses?.map((c, i) => (
              <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: `hsl(${(i * 55 + 160) % 360}, 60%, 50%)` }}>
                  {c.code?.slice(0, 2)}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-700">{c.name}</p>
                  <p className="text-[11px] text-slate-400">{c.code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-[15px] font-semibold text-slate-800 mb-4">Recent Notices</h2>
          <div className="space-y-3">
            {data?.notices?.length === 0 && <p className="text-slate-400 text-sm">No notices</p>}
            {data?.notices?.map((n, i) => (
              <div key={n._id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `hsl(${(i * 70 + 220) % 360}, 60%, 93%)` }}>
                  <Bell size={12} style={{ color: `hsl(${(i * 70 + 220) % 360}, 55%, 45%)` }} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-700">{n.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
