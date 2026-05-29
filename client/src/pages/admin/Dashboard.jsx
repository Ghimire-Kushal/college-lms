import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, Bell, ArrowRight, X, ChevronRight } from 'lucide-react';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

const FACULTY_META = {
  'Science':          { icon: '🔬', color: '#2563eb' },
  'Management':       { icon: '📊', color: '#059669' },
  'Law':              { icon: '⚖️',  color: '#7c3aed' },
  'Computer Science': { icon: '💻', color: '#0891b2' },
  'Hotel Management': { icon: '🏨', color: '#d97706' },
  'Humanities':       { icon: '📚', color: '#db2777' },
  'Education':        { icon: '🎓', color: '#65a30d' },
};

export default function AdminDashboard() {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);   // faculty name
  const [detail, setDetail]         = useState(null);   // { students, courses }
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeClass, setActiveClass]     = useState(11);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const selectFaculty = async (faculty) => {
    if (selected === faculty.name) { setSelected(null); setDetail(null); return; }
    setSelected(faculty.name);
    setActiveClass(11);
    setDetailLoading(true);
    try {
      const [studRes, courseRes] = await Promise.all([
        api.get('/admin/students', { params: { stream: faculty.name, limit: 100 } }),
        api.get('/admin/courses',  { params: { stream: faculty.name } }),
      ]);
      setDetail({ students: studRes.data, courses: courseRes.data });
    } catch { toast.error('Failed to load faculty details'); }
    finally { setDetailLoading(false); }
  };

  if (loading) return (
    <div className="space-y-5">
      <Skeleton className="h-28" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-48" />
      <Skeleton className="h-36" />
    </div>
  );

  const meta = selected ? (FACULTY_META[selected] || { icon: '📖', color: '#64748b' }) : null;
  const filteredStudents = detail?.students?.filter(s => s.grade === activeClass) || [];
  const filteredCourses  = detail?.courses?.filter(c => Number(c.grade) === activeClass) || [];

  return (
    <div className="space-y-5">

      {/* ── Welcome banner ── */}
      <div className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div>
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider">Admin Portal</p>
          <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Welcome back! 👋</h2>
          <p className="text-blue-200/70 text-sm mt-1">Canvas Academy Udayapur — overview for today.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <p className="text-2xl font-bold text-white">{data?.totalStudents ?? 0}</p>
            <p className="text-blue-200 text-[11px] font-medium mt-0.5">Students</p>
          </div>
          <div className="text-center px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <p className="text-2xl font-bold text-white">{data?.totalCourses ?? 0}</p>
            <p className="text-blue-200 text-[11px] font-medium mt-0.5">Subjects</p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Students"  value={data?.totalStudents ?? 0} icon={GraduationCap} color="blue"   />
        <StatCard title="Total Teachers"  value={data?.totalTeachers ?? 0} icon={Users}         color="teal"   />
        <StatCard title="Active Subjects" value={data?.totalCourses ?? 0}  icon={BookOpen}      color="green"  />
        <StatCard title="Notices Posted"  value={data?.totalNotices ?? 0}  icon={Bell}          color="yellow" />
      </div>

      {/* ── Faculties ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-slate-800">Faculties</h2>
          <p className="text-[12px] text-slate-400">Click a faculty to view details</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(data?.faculties || []).map(f => {
            const m       = FACULTY_META[f.name] || { icon: '📖', color: '#64748b' };
            const isActive = selected === f.name;
            return (
              <button
                key={f.name}
                onClick={() => selectFaculty(f)}
                className="text-left border rounded-xl p-4 transition-all hover:shadow-md"
                style={{
                  borderColor:  isActive ? m.color : '#e2e8f0',
                  background:   isActive ? `${m.color}08` : '#ffffff',
                  boxShadow:    isActive ? `0 0 0 2px ${m.color}33` : undefined,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{m.icon}</span>
                  <div className="w-2 h-2 rounded-full" style={{ background: f.total > 0 ? m.color : '#e2e8f0' }} />
                </div>
                <p className="text-[13px] font-bold text-slate-800 leading-tight">{f.name}</p>
                <div className="mt-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Class 11</span>
                    <span className="font-semibold" style={{ color: m.color }}>{f.students11}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Class 12</span>
                    <span className="font-semibold" style={{ color: m.color }}>{f.students12}</span>
                  </div>
                  <div className="h-px bg-slate-100 my-1.5" />
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Subjects</span>
                    <span className="font-semibold text-slate-600">{f.courses}</span>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{
                      width: `${data?.totalStudents ? Math.min(100, (f.total / data.totalStudents) * 100) : 0}%`,
                      background: m.color,
                    }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 text-right">{f.total} students</p>
              </button>
            );
          })}
        </div>

        {/* ── Faculty detail panel ── */}
        {selected && (
          <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden">

            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100"
              style={{ background: `${meta.color}08` }}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{meta.icon}</span>
                <div>
                  <p className="font-bold text-slate-800 text-[14px]">{selected}</p>
                  <p className="text-[11px] text-slate-400">
                    {detail?.students?.length || 0} students &nbsp;·&nbsp; {detail?.courses?.length || 0} subjects
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/admin/courses')}
                  className="flex items-center gap-1 text-[12px] font-semibold transition hover:opacity-80"
                  style={{ color: meta.color }}>
                  View subjects <ChevronRight size={13} />
                </button>
                <button
                  onClick={() => navigate('/admin/students')}
                  className="flex items-center gap-1 text-[12px] font-semibold transition hover:opacity-80"
                  style={{ color: meta.color }}>
                  View students <ChevronRight size={13} />
                </button>
                <button onClick={() => { setSelected(null); setDetail(null); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Class tabs */}
            <div className="flex gap-1 px-5 pt-4">
              {[11, 12].map(g => {
                const cnt = (detail?.students || []).filter(s => s.grade === g).length;
                return (
                  <button key={g}
                    onClick={() => setActiveClass(g)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
                    style={activeClass === g
                      ? { background: meta.color, color: '#fff' }
                      : { background: '#f1f5f9', color: '#64748b' }
                    }>
                    <GraduationCap size={13} />
                    Class {g}
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full font-medium"
                      style={activeClass === g
                        ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                        : { background: '#e2e8f0', color: '#64748b' }
                      }>
                      {cnt}
                    </span>
                  </button>
                );
              })}
            </div>

            {detailLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                {/* Students */}
                <div className="p-5">
                  <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Students — Class {activeClass}
                  </p>
                  {filteredStudents.length === 0 ? (
                    <p className="text-[13px] text-slate-400 py-4 text-center">No students in Class {activeClass}</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {filteredStudents.map((s, i) => {
                        const colors = ['#2563eb','#059669','#7c3aed','#d97706','#0891b2','#db2777'];
                        return (
                          <div key={s._id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                              style={{ background: colors[i % colors.length] }}>
                              {s.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-slate-800 truncate">{s.name}</p>
                              <p className="text-[11px] text-slate-400">{s.rollNo} · Section {s.section || '—'}</p>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 shrink-0">{s.rollNo}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Subjects */}
                <div className="p-5">
                  <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Subjects — Class {activeClass}
                  </p>
                  {filteredCourses.length === 0 ? (
                    <p className="text-[13px] text-slate-400 py-4 text-center">No subjects in Class {activeClass}</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {filteredCourses.map(c => (
                        <div key={c._id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                            style={{ background: meta.color }}>
                            {c.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-800 truncate">{c.name}</p>
                            <p className="text-[11px] text-slate-400">{c.code} · {c.students?.length || 0} students</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                              style={{ background: c.teacher ? meta.color : '#cbd5e1' }}>
                              {c.teacher?.name?.[0] || '?'}
                            </div>
                            <span className="text-[11px] text-slate-400 hidden sm:block truncate max-w-[80px]">
                              {c.teacher?.name || <span className="italic text-rose-400">—</span>}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Recent Notices ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-slate-800">Recent Notices</h2>
          <button onClick={() => navigate('/admin/notices')}
            className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-800 transition">
            View all <ArrowRight size={12} />
          </button>
        </div>
        {!data?.recentNotices?.length ? (
          <p className="text-sm text-slate-400 py-4 text-center">No notices yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.recentNotices.map((n, i) => {
              const colors = [
                { bg: '#fef9ec', border: '#f5e8c0', icon: '#d97706' },
                { bg: '#fef0f0', border: '#f5d0d0', icon: '#2563eb' },
                { bg: '#edf7f5', border: '#c5e8e2', icon: '#0f766e' },
              ];
              const nc = colors[i % colors.length];
              return (
                <div key={n._id} className="flex items-start gap-3 p-3.5 rounded-xl border"
                  style={{ background: nc.bg, borderColor: nc.border }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: nc.border }}>
                    <Bell size={13} style={{ color: nc.icon }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">{n.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {n.postedBy?.name} · {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
