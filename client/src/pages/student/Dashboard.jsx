import { useState, useEffect } from 'react';
import { BookOpen, UserCheck, ClipboardList, Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

function AttendanceRing({ pct }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? '#1E3535' : pct >= 50 ? '#b87a00' : '#8B3030';
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e8e0da" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{pct}%</span>
        <span className="text-[9px] uppercase tracking-wide" style={{ color: '#94a3b8' }}>Attend.</span>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { dark } = useTheme();

  useEffect(() => {
    api.get('/student/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-5">
      <Skeleton className="h-28" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-56" /><Skeleton className="lg:col-span-2 h-56" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-48" /><Skeleton className="h-48" />
      </div>
    </div>
  );

  const attPct  = parseFloat(data?.attendancePercentage || 0);
  const isLowAtt = attPct < 75;
  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#ede8e4';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1c1c 0%, #1a2e2e 55%, #1e3535 100%)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F2C04E 0%, transparent 70%)', opacity: 0.18 }} />
        <p className="text-[#F2C04E] text-xs font-semibold uppercase tracking-wider">Student Portal</p>
        <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Hi, {user?.name?.split(' ')[0]}! 🎓</h2>
        <p className="text-white/50 text-sm mt-1">Keep up the great work and stay on top of your studies.</p>
      </div>

      {/* Attendance warning */}
      {isLowAtt && (
        <div className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ background: dark ? '#2a1414' : '#fff0f0', borderColor: dark ? '#5a2020' : '#fca5a5' }}>
          <AlertTriangle size={18} className="shrink-0" style={{ color: '#8B3030' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#8B3030' }}>Attendance Warning</p>
            <p className="text-xs mt-0.5" style={{ color: dark ? '#f5a0a0' : '#b45309' }}>
              Your attendance is {attPct}% — below the required 75%. Please attend more classes.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Enrolled Courses"  value={data?.totalCourses ?? 0}               icon={BookOpen}     color="maroon"                    gradient />
        <StatCard title="Attendance Rate"   value={`${attPct}%`}                          icon={UserCheck}    color={isLowAtt ? 'red' : 'teal'} gradient />
        <StatCard title="Classes Attended"  value={`${data?.presentClasses ?? 0}/${data?.totalClasses ?? 0}`} icon={UserCheck} color="green"    gradient />
        <StatCard title="Due Assignments"   value={data?.upcomingAssignments?.length ?? 0} icon={ClipboardList} color="gold"                   gradient />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance ring */}
        <div className="rounded-2xl p-5 sm:p-6 border shadow-sm flex flex-col items-center justify-center"
          style={{ background: cardBg, borderColor: border }}>
          <h2 className="text-[15px] font-semibold mb-4" style={{ color: headClr }}>Attendance Summary</h2>
          <AttendanceRing pct={attPct} />
          <div className="mt-4 flex gap-6 text-center">
            <div>
              <p className="text-xl font-bold" style={{ color: '#1E3535' }}>{data?.presentClasses ?? 0}</p>
              <p className="text-[11px]" style={{ color: subClr }}>Present</p>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: '#8B3030' }}>{(data?.totalClasses ?? 0) - (data?.presentClasses ?? 0)}</p>
              <p className="text-[11px]" style={{ color: subClr }}>Absent</p>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: headClr }}>{data?.totalClasses ?? 0}</p>
              <p className="text-[11px]" style={{ color: subClr }}>Total</p>
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="lg:col-span-2 rounded-2xl p-5 sm:p-6 border shadow-sm"
          style={{ background: cardBg, borderColor: border }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold" style={{ color: headClr }}>Upcoming Assignments</h2>
            <span className="text-xs font-medium" style={{ color: subClr }}>{data?.upcomingAssignments?.length || 0} pending</span>
          </div>
          <div className="space-y-2.5">
            {data?.upcomingAssignments?.length === 0 && (
              <div className="py-8 text-center" style={{ color: subClr }}>
                <CheckCircle size={28} className="mx-auto mb-2 opacity-30" style={{ color: '#1E3535' }} />
                <p className="text-sm opacity-50">All caught up!</p>
              </div>
            )}
            {data?.upcomingAssignments?.map(a => {
              const daysLeft = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              const urgent = daysLeft <= 2;
              return (
                <div key={a._id} className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                  style={{
                    background: urgent ? (dark ? '#2a1414' : '#fef0f0') : (dark ? '#0f1e1e' : '#f5faf7'),
                    borderColor: urgent ? (dark ? '#5a2020' : '#fca5a5') : border,
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: urgent ? (dark ? '#3d1515' : '#fde8e8') : (dark ? '#122828' : '#e0f0e8'), color: urgent ? '#8B3030' : '#1E3535' }}>
                    {urgent ? <Clock size={15} /> : <ClipboardList size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: headClr }}>{a.title}</p>
                    <p className="text-[11px]" style={{ color: subClr }}>{a.course?.name}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: urgent ? (dark ? '#3d1515' : '#fde8e8') : (dark ? '#122828' : '#e0f0e8'), color: urgent ? '#8B3030' : '#1E3535' }}>
                    {daysLeft}d left
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Courses */}
        <div className="rounded-2xl p-5 sm:p-6 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
          <h2 className="text-[15px] font-semibold mb-4" style={{ color: headClr }}>My Courses</h2>
          <div className="space-y-2.5">
            {!data?.courses?.length && <p className="text-sm" style={{ color: subClr }}>No courses enrolled</p>}
            {data?.courses?.map((c, i) => {
              const colors = ['#8B3030','#1E3535','#b87a00','#2a6648'];
              return (
                <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: dark ? '#1a2828' : '#faf7f5', borderColor: border }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: colors[i % colors.length] }}>
                    {c.code?.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: headClr }}>{c.name}</p>
                    <p className="text-[11px]" style={{ color: subClr }}>{c.code}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notices */}
        <div className="rounded-2xl p-5 sm:p-6 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
          <h2 className="text-[15px] font-semibold mb-4" style={{ color: headClr }}>Recent Notices</h2>
          <div className="space-y-2.5">
            {!data?.notices?.length && <p className="text-sm" style={{ color: subClr }}>No notices</p>}
            {data?.notices?.map((n, i) => {
              const colors = ['#b87a00','#8B3030','#1E3535'];
              const bgs = [dark ? '#1a1a0d' : '#fef9ec', dark ? '#1a1414' : '#fef0f0', dark ? '#0d1a1a' : '#edf7f5'];
              return (
                <div key={n._id} className="flex items-start gap-3 p-3 rounded-xl border"
                  style={{ background: bgs[i % bgs.length], borderColor: border }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: dark ? '#1e2e2e' : '#f0ebe8' }}>
                    <Bell size={12} style={{ color: colors[i % colors.length] }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: headClr }}>{n.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: subClr }}>
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
