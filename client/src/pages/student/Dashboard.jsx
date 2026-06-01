import { useState, useEffect } from 'react';
import { BookOpen, UserCheck, ClipboardList, Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
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

function AttendanceRing({ pct }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const track = '#e5e7eb';
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke={track} strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[16px] font-bold" style={{ color }}>{pct}%</span>
        <span className="text-[9px] uppercase tracking-wide text-[#9ca3af]">Attend.</span>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

  const attPct   = parseFloat(data?.attendancePercentage || 0);
  const isLowAtt = attPct < 75;
  const surface  = dark ? '#1e293b' : '#ffffff';
  const border   = dark ? '#334155' : '#e5e7eb';
  const textHead = dark ? '#f1f5f9' : '#111827';
  const textSub  = dark ? '#94a3b8' : '#6b7280';

  return (
    <div className="space-y-5">

      {/* Attendance warning */}
      {isLowAtt && (
        <div className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ background: dark ? '#450a0a22' : '#fef2f2', borderColor: dark ? '#7f1d1d' : '#fecaca' }}>
          <AlertTriangle size={16} className="shrink-0 text-[#ef4444]" />
          <div>
            <p className="text-[13px] font-semibold text-[#dc2626]">Low Attendance Warning</p>
            <p className="text-[12px] mt-0.5" style={{ color: dark ? '#fca5a5' : '#b91c1c' }}>
              Your attendance is {attPct}% — below the required 75%. Please attend more classes.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Enrolled Courses" value={data?.totalCourses ?? 0}               icon={BookOpen}      color="primary" />
        <StatCard title="Attendance Rate"  value={`${attPct}%`}                          icon={UserCheck}     color={isLowAtt ? 'red' : 'green'} />
        <StatCard title="Classes Attended" value={`${data?.presentClasses ?? 0}/${data?.totalClasses ?? 0}`} icon={UserCheck} color="blue" />
        <StatCard title="Due Assignments"  value={data?.upcomingAssignments?.length ?? 0} icon={ClipboardList} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance ring */}
        <div className="rounded-xl border p-5 flex flex-col items-center justify-center"
          style={{ background: surface, borderColor: border }}>
          <h3 className="text-[14px] font-semibold mb-4 self-start" style={{ color: textHead }}>Attendance</h3>
          <AttendanceRing pct={attPct} />
          <div className="mt-4 flex gap-6 text-center">
            <div>
              <p className="text-[20px] font-bold text-[#10b981]">{data?.presentClasses ?? 0}</p>
              <p className="text-[11px]" style={{ color: textSub }}>Present</p>
            </div>
            <div>
              <p className="text-[20px] font-bold text-[#ef4444]">{(data?.totalClasses ?? 0) - (data?.presentClasses ?? 0)}</p>
              <p className="text-[11px]" style={{ color: textSub }}>Absent</p>
            </div>
            <div>
              <p className="text-[20px] font-bold" style={{ color: textHead }}>{data?.totalClasses ?? 0}</p>
              <p className="text-[11px]" style={{ color: textSub }}>Total</p>
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="lg:col-span-2 rounded-xl border p-5" style={{ background: surface, borderColor: border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold" style={{ color: textHead }}>Upcoming Assignments</h3>
            <span className="text-[12px]" style={{ color: textSub }}>{data?.upcomingAssignments?.length || 0} pending</span>
          </div>
          <div className="space-y-2">
            {!data?.upcomingAssignments?.length ? (
              <div className="py-8 text-center">
                <CheckCircle size={24} className="mx-auto mb-2 text-[#10b981]" style={{ opacity: 0.4 }} />
                <p className="text-[13px]" style={{ color: textSub }}>All caught up!</p>
              </div>
            ) : data.upcomingAssignments.map(a => {
              const daysLeft = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              const urgent = daysLeft <= 2;
              return (
                <div key={a._id} className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{
                    borderColor: urgent ? '#fecaca' : border,
                    background: urgent ? (dark ? '#450a0a22' : '#fef2f2') : 'transparent',
                  }}>
                  <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: urgent ? (dark ? '#450a0a' : '#fef2f2') : (dark ? '#0f172a' : '#f3f4f6') }}>
                    {urgent ? <Clock size={13} style={{ color: '#dc2626' }} /> : <ClipboardList size={13} style={{ color: textSub }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: textHead }}>{a.title}</p>
                    <p className="text-[11px]" style={{ color: textSub }}>{a.course?.name}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-md"
                    style={{ background: dark ? '#0f172a' : '#f3f4f6', color: urgent ? '#dc2626' : textSub }}>
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
        <div className="rounded-xl border p-5" style={{ background: surface, borderColor: border }}>
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: textHead }}>My Courses</h3>
          <div className="space-y-2">
            {!data?.courses?.length
              ? <p className="text-[13px]" style={{ color: textSub }}>No courses enrolled</p>
              : data.courses.map((c, i) => (
                <div key={c._id} className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ borderColor: border }}
                  onMouseEnter={e => { e.currentTarget.style.background = dark ? '#0f172a' : '#f9fafb'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                    style={{ background: COURSE_COLORS[i % COURSE_COLORS.length] }}>
                    {c.code?.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: textHead }}>{c.name}</p>
                    <p className="text-[11px]" style={{ color: textSub }}>{c.code}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Notices */}
        <div className="rounded-xl border p-5" style={{ background: surface, borderColor: border }}>
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: textHead }}>Recent Notices</h3>
          <div className="space-y-2">
            {!data?.notices?.length
              ? <p className="text-[13px]" style={{ color: textSub }}>No notices</p>
              : data.notices.map(n => (
                <div key={n._id} className="flex items-start gap-3 p-3 rounded-lg border"
                  style={{ borderColor: border }}
                  onMouseEnter={e => { e.currentTarget.style.background = dark ? '#0f172a' : '#f9fafb'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: dark ? '#0f172a' : '#f3f4f6' }}>
                    <Bell size={12} style={{ color: textSub }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: textHead }}>{n.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: textSub }}>
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
