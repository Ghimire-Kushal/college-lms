import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GraduationCap, Users, BookOpen, Bell, TrendingUp, ArrowRight } from 'lucide-react';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl">
      <p className="font-medium">{label}</p>
      <p className="text-indigo-300">{payload[0].value} students</p>
    </div>
  );
};

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-40" />
    </div>
  );

  const chartData = data?.semesterStats?.map(s => ({ semester: `Sem ${s._id}`, students: s.count })) || [];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
        <div>
          <p className="text-indigo-300 text-sm font-medium">Admin Portal</p>
          <h2 className="text-white text-2xl font-bold mt-0.5">Welcome back! 👋</h2>
          <p className="text-indigo-200/70 text-sm mt-1">Here's an overview of your institution today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-center px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <p className="text-2xl font-bold text-white">{data?.totalStudents ?? 0}</p>
            <p className="text-indigo-300 text-xs">Students</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <p className="text-2xl font-bold text-white">{data?.totalCourses ?? 0}</p>
            <p className="text-indigo-300 text-xs">Courses</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard title="Total Students"  value={data?.totalStudents ?? 0} icon={GraduationCap} color="blue"   gradient />
        <StatCard title="Total Teachers"  value={data?.totalTeachers ?? 0} icon={Users}         color="green"  gradient />
        <StatCard title="Active Courses"  value={data?.totalCourses ?? 0}  icon={BookOpen}       color="sky"    gradient />
        <StatCard title="Notices Posted"  value={data?.totalNotices ?? 0}  icon={Bell}           color="yellow" gradient />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[15px] font-semibold text-slate-800">Students by Semester</h2>
              <p className="text-slate-400 text-xs mt-0.5">Distribution across academic semesters</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium bg-indigo-50 px-2.5 py-1.5 rounded-lg">
              <TrendingUp size={13} /> Overview
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="semester" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="students" radius={[6, 6, 0, 0]} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-slate-300">
              <BarChart className="w-12 h-12 mb-2 text-slate-200" />
              <p className="text-sm">No data yet</p>
            </div>
          )}
        </div>

        {/* Recent Students */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-slate-800">Recent Students</h2>
            <span className="text-[11px] text-slate-400 font-medium">Latest added</span>
          </div>
          <div className="space-y-3">
            {data?.recentStudents?.length === 0 && (
              <div className="flex flex-col items-center py-6 text-slate-300">
                <GraduationCap size={28} className="mb-2" />
                <p className="text-sm">No students yet</p>
              </div>
            )}
            {data?.recentStudents?.map((s, i) => (
              <div key={s._id} className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: `hsl(${(i * 67 + 200) % 360}, 70%, 55%)` }}>
                  {s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-700 truncate">{s.name}</p>
                  <p className="text-[11px] text-slate-400">{s.studentId} · Semester {s.semester}</p>
                </div>
                <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">
                  §{s.section || '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Notices */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-slate-800">Recent Notices</h2>
          <span className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
            View all <ArrowRight size={13} />
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data?.recentNotices?.length === 0 && (
            <p className="text-slate-400 text-sm col-span-3">No notices yet</p>
          )}
          {data?.recentNotices?.map((n, i) => (
            <div key={n._id} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `hsl(${(i * 83 + 220) % 360}, 70%, 94%)` }}>
                <Bell size={14} style={{ color: `hsl(${(i * 83 + 220) % 360}, 60%, 45%)` }} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-700 truncate">{n.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {n.postedBy?.name} · {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
