import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GraduationCap, Users, BookOpen, Bell, TrendingUp, ArrowRight } from 'lucide-react';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs shadow-xl"
      style={{ background: '#1E3535', color: '#fff' }}>
      <p className="font-medium">{label}</p>
      <p style={{ color: '#F2C04E' }}>{payload[0].value} students</p>
    </div>
  );
};

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { dark } = useTheme();

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-5">
      <Skeleton className="h-32" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Skeleton className="lg:col-span-3 h-64" />
        <Skeleton className="lg:col-span-2 h-64" />
      </div>
      <Skeleton className="h-36" />
    </div>
  );

  const chartData = data?.semesterStats?.map(s => ({ semester: `Sem ${s._id}`, students: s.count })) || [];
  const cardBg   = dark ? '#131e1e' : '#ffffff';
  const border   = dark ? '#1e2e2e' : '#ede8e4';
  const headClr  = dark ? '#e2e8f0' : '#1e293b';
  const subClr   = dark ? '#6e7681' : '#64748b';

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0a1414 0%, #162828 55%, #1e3535 100%)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F2C04E 0%, transparent 70%)', opacity: 0.15 }} />
        <div>
          <p className="text-[#F2C04E] text-xs font-semibold uppercase tracking-wider">Admin Portal</p>
          <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Welcome back! 👋</h2>
          <p className="text-white/50 text-sm mt-1">Here's an overview of your institution today.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <p className="text-2xl font-bold text-white">{data?.totalStudents ?? 0}</p>
            <p className="text-[#F2C04E] text-[11px] font-medium mt-0.5">Students</p>
          </div>
          <div className="text-center px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <p className="text-2xl font-bold text-white">{data?.totalCourses ?? 0}</p>
            <p className="text-[#F2C04E] text-[11px] font-medium mt-0.5">Courses</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Students"  value={data?.totalStudents ?? 0} icon={GraduationCap} color="maroon" gradient />
        <StatCard title="Total Teachers"  value={data?.totalTeachers ?? 0} icon={Users}         color="teal"   gradient />
        <StatCard title="Active Courses"  value={data?.totalCourses ?? 0}  icon={BookOpen}      color="green"  gradient />
        <StatCard title="Notices Posted"  value={data?.totalNotices ?? 0}  icon={Bell}          color="gold"   gradient />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-3 rounded-2xl p-5 sm:p-6 border shadow-sm"
          style={{ background: cardBg, borderColor: border }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[15px] font-semibold" style={{ color: headClr }}>Students by Semester</h2>
              <p className="text-xs mt-0.5" style={{ color: subClr }}>Distribution across academic semesters</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
              style={{ background: dark ? '#1a2828' : '#f5ede8', color: '#8B3030' }}>
              <TrendingUp size={13} /> Overview
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e2e2e' : '#f1ebe6'} vertical={false} />
                <XAxis dataKey="semester" tick={{ fontSize: 11, fill: subClr }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: subClr }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="students" radius={[6, 6, 0, 0]} fill="#8B3030" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center" style={{ color: subClr }}>
              <TrendingUp size={28} className="mb-2 opacity-30" />
              <p className="text-sm opacity-50">No data yet</p>
            </div>
          )}
        </div>

        {/* Recent Students */}
        <div className="lg:col-span-2 rounded-2xl p-5 sm:p-6 border shadow-sm"
          style={{ background: cardBg, borderColor: border }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold" style={{ color: headClr }}>Recent Students</h2>
            <span className="text-[11px] font-medium" style={{ color: subClr }}>Latest added</span>
          </div>
          <div className="space-y-3">
            {!data?.recentStudents?.length && (
              <div className="flex flex-col items-center py-8" style={{ color: subClr }}>
                <GraduationCap size={28} className="mb-2 opacity-30" />
                <p className="text-sm opacity-50">No students yet</p>
              </div>
            )}
            {data?.recentStudents?.map((s, i) => {
              const colors = ['#8B3030','#1E3535','#b87a00','#2a6648','#7A2E2E'];
              return (
                <div key={s._id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: colors[i % colors.length] }}>
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: headClr }}>{s.name}</p>
                    <p className="text-[11px]" style={{ color: subClr }}>{s.studentId} · Sem {s.semester}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border shrink-0"
                    style={{ background: dark ? '#1a2828' : '#f5f0ed', color: subClr, borderColor: border }}>
                    §{s.section || '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Notices */}
      <div className="rounded-2xl p-5 sm:p-6 border shadow-sm"
        style={{ background: cardBg, borderColor: border }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold" style={{ color: headClr }}>Recent Notices</h2>
          <span className="flex items-center gap-1 text-xs font-semibold cursor-pointer"
            style={{ color: '#8B3030' }}>
            View all <ArrowRight size={13} />
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {!data?.recentNotices?.length && (
            <p className="text-sm col-span-3" style={{ color: subClr }}>No notices yet</p>
          )}
          {data?.recentNotices?.map((n, i) => {
            const noticeColors = [
              { bg: dark ? '#1a1a0d' : '#fef9ec', border: dark ? '#2a2808' : '#f5e8c0', icon: '#b87a00' },
              { bg: dark ? '#1a1414' : '#fef0f0', border: dark ? '#2e1a1a' : '#f5d0d0', icon: '#8B3030' },
              { bg: dark ? '#0d1a1a' : '#edf7f5', border: dark ? '#122828' : '#c5e8e2', icon: '#1E3535' },
            ];
            const nc = noticeColors[i % noticeColors.length];
            return (
              <div key={n._id} className="flex items-start gap-3 p-3.5 rounded-xl border transition-all hover:shadow-sm"
                style={{ background: nc.bg, borderColor: nc.border }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: nc.border }}>
                  <Bell size={14} style={{ color: nc.icon }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: headClr }}>{n.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: subClr }}>
                    {n.postedBy?.name} · {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
