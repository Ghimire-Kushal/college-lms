import { useState, useEffect } from 'react';
import {
  UserCheck, Eye, Edit2, Calendar, CheckCircle, X,
  BarChart2, Clock, Users, TrendingUp, BookOpen, Activity,
} from 'lucide-react';
import Modal from '../../components/Modal';
import { Avatar } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const COURSE_ACCENTS = ['#8B3030', '#1E3535', '#b87a00', '#2a5080', '#5a3080', '#1a6648'];

export default function TeacherAttendance() {
  const [courses, setCourses]         = useState([]);
  const [records, setRecords]         = useState([]);
  const [allRecords, setAllRecords]   = useState([]);
  const [activePanel, setActivePanel] = useState(null);
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance]   = useState([]);
  const [saving, setSaving]           = useState(false);
  const [summary, setSummary]         = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [filterCourse, setFilter]     = useState('');
  const { dark } = useTheme();

  // ── Tokens ──────────────────────────────────────────────
  const bg      = dark ? '#0d1212' : '#f4f6f8';
  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#e2e8f0';
  const headClr = dark ? '#e2e8f0' : '#0f172a';
  const subClr  = dark ? '#6e7681' : '#64748b';
  const mutedBg = dark ? '#0f1e1e' : '#f8fafc';
  const inputBg = dark ? '#0a1414' : '#f1f5f9';

  const loadCourses    = () => api.get('/teacher/courses').then(r => setCourses(r.data));
  const loadAllRecords = () => api.get('/teacher/attendance').then(r => setAllRecords(r.data));
  const loadRecords    = () => api.get('/teacher/attendance', { params: { courseId: filterCourse } }).then(r => setRecords(r.data));

  useEffect(() => { loadCourses(); loadAllRecords(); }, []);
  useEffect(() => { loadRecords(); }, [filterCourse]);

  // ── Per-course stats from all records ────────────────────
  const courseStats = (courseId) => {
    const cr = allRecords.filter(r => r.course?._id === courseId);
    if (!cr.length) return { classes: 0, avg: 0 };
    const avg = Math.round(
      cr.reduce((acc, r) => {
        const p = r.records?.filter(x => x.status === 'present').length || 0;
        const t = r.records?.length || 1;
        return acc + (p / t) * 100;
      }, 0) / cr.length
    );
    return { classes: cr.length, avg };
  };

  // ── Global stats ─────────────────────────────────────────
  const totalClasses = allRecords.length;
  const avgPct = allRecords.length > 0
    ? Math.round(allRecords.reduce((acc, r) => {
        const p = r.records?.filter(x => x.status === 'present').length || 0;
        const t = r.records?.length || 1;
        return acc + (p / t) * 100;
      }, 0) / allRecords.length)
    : 0;

  // ── Handlers ─────────────────────────────────────────────
  const openTake = (course) => {
    setDate(new Date().toISOString().split('T')[0]);
    setAttendance(
      course.students?.map(s => ({ student: s._id, status: 'present', name: s.name, studentId: s.studentId, remarks: '' })) || []
    );
    setActivePanel({ courseId: course._id, courseName: course.name, mode: 'take' });
    setTimeout(() => document.getElementById('attendance-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const openEdit = (record) => {
    setActivePanel({ courseId: record.course?._id, courseName: record.course?.name, mode: 'edit', record });
    setAttendance(record.records.map(r => ({
      student: r.student._id, status: r.status, name: r.student.name, studentId: r.student.studentId, remarks: r.remarks || '',
    })));
    setDate(new Date(record.date).toISOString().split('T')[0]);
    setTimeout(() => document.getElementById('attendance-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const closePanel = () => { setActivePanel(null); setAttendance([]); };

  const openSummary = async (courseId) => {
    const r = await api.get(`/teacher/attendance/summary/${courseId}`);
    setSummary(r.data);
    setShowSummary(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/teacher/attendance', {
        courseId: activePanel.courseId, date,
        records: attendance.map(a => ({ student: a.student, status: a.status, remarks: a.remarks })),
      });
      toast.success('Attendance submitted');
      loadRecords(); loadAllRecords(); closePanel();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put(`/teacher/attendance/${activePanel.record._id}`, {
        date, records: attendance.map(a => ({ student: a.student, status: a.status, remarks: a.remarks })),
      });
      toast.success('Attendance updated');
      loadRecords(); loadAllRecords(); closePanel();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const togglePresent  = (id) => setAttendance(a => a.map(s => s.student === id ? { ...s, status: s.status === 'absent' ? 'present' : 'absent' } : s));
  const toggleLate     = (id) => setAttendance(a => a.map(s => s.student === id && s.status !== 'absent' ? { ...s, status: s.status === 'late' ? 'present' : 'late' } : s));
  const setRemarks     = (id, val) => setAttendance(a => a.map(s => s.student === id ? { ...s, remarks: val } : s));
  const markAllPresent = () => setAttendance(a => a.map(s => ({ ...s, status: allPresent ? 'absent' : 'present' })));
  const allPresent     = attendance.length > 0 && attendance.every(s => s.status !== 'absent');
  const pct    = (s) => s.total > 0 ? ((s.present + s.late * 0.5) / s.total * 100).toFixed(1) : 0;

  const presentCount = attendance.filter(s => s.status === 'present').length;
  const absentCount  = attendance.filter(s => s.status === 'absent').length;
  const lateCount    = attendance.filter(s => s.status === 'late').length;

  // ── Sub-components ────────────────────────────────────────
  const StatCard = ({ icon: Icon, value, label, color, sub }) => (
    <div className="rounded-2xl p-5 border flex items-center gap-4 shadow-sm transition-all hover:shadow-md"
      style={{ background: cardBg, borderColor: border }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: dark ? `${color}22` : `${color}15` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none" style={{ color: headClr }}>{value}</p>
        <p className="text-[12px] mt-1 font-medium" style={{ color: subClr }}>{label}</p>
        {sub && <p className="text-[11px] mt-0.5" style={{ color: subClr }}>{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="max-w-screen-xl mx-auto space-y-6 p-1">

        {/* ── Page Header ───────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden shadow-sm"
          style={{ background: 'linear-gradient(135deg, #0d2222 0%, #1E3535 60%, #2a5050 100%)' }}>
          <div className="px-8 py-8 relative">
            <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at right, #F2C04E, transparent)' }} />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(242,192,78,0.2)', color: '#F2C04E' }}>
                    Teacher Portal
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Attendance</h1>
                <p className="mt-1.5 text-[14px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Manage and track class attendance across all your courses.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[13px] px-4 py-2.5 rounded-xl shrink-0"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
                <Calendar size={14} />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Row ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Activity}   value={totalClasses}      label="Total Classes Held"     color="#1E3535" sub={`Across ${courses.length} course${courses.length !== 1 ? 's' : ''}`} />
          <StatCard icon={TrendingUp} value={`${avgPct}%`}      label="Average Attendance Rate" color="#059669" sub={avgPct >= 75 ? 'Good standing' : 'Needs attention'} />
          <StatCard icon={BookOpen}   value={courses.length}    label="Courses Assigned"        color="#8B3030" sub="Active this semester" />
        </div>

        {/* ── Inline Attendance Panel ───────────────────── */}
        {activePanel && (
          <div id="attendance-panel" className="rounded-2xl border shadow-md overflow-hidden"
            style={{ background: cardBg, borderColor: '#1E3535', boxShadow: `0 0 0 2px #1E353530` }}>

            {/* Panel Header */}
            <div className="px-8 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{ borderColor: border, background: dark ? '#0a1818' : '#f0faf8' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: dark ? '#1a2e2e' : '#d4ede8' }}>
                  <UserCheck size={22} style={{ color: '#1E3535' }} />
                </div>
                <div>
                  <p className="text-[18px] font-bold" style={{ color: headClr }}>
                    {activePanel.mode === 'edit' ? 'Edit Attendance Record' : 'Take Attendance'}
                  </p>
                  <p className="text-[13px] mt-0.5" style={{ color: subClr }}>{activePanel.courseName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
                  style={{ background: inputBg, borderColor: border }}>
                  <Calendar size={15} style={{ color: subClr }} />
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="outline-none bg-transparent text-[14px] font-medium"
                    style={{ color: headClr }} />
                </div>
                <button onClick={closePanel}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                  style={{ background: dark ? '#1a2828' : '#f1f5f9', color: subClr }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tally Bar */}
            <div className="px-8 py-3.5 border-b flex items-center gap-6 flex-wrap"
              style={{ borderColor: border, background: dark ? '#0c1616' : '#fafcfb' }}>
              <span className="text-[13px] font-semibold" style={{ color: subClr }}>
                {attendance.length} students
              </span>
              <div className="flex items-center gap-2.5 ml-auto">
                {[
                  { count: presentCount, label: 'Present', bg: dark ? '#0a2018' : '#dcfce7', clr: '#16a34a' },
                  { count: absentCount,  label: 'Absent',  bg: dark ? '#2a1010' : '#fee2e2', clr: '#dc2626' },
                  { count: lateCount,    label: 'Late',    bg: dark ? '#241800' : '#fef9c3', clr: '#ca8a04' },
                ].map(({ count, label, bg: tbg, clr }) => (
                  <span key={label} className="px-3.5 py-1.5 rounded-full text-[12px] font-bold"
                    style={{ background: tbg, color: clr }}>
                    {count} {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Student List */}
            <form onSubmit={activePanel.mode === 'edit' ? handleEditSubmit : handleSubmit}>
              {attendance.length === 0 ? (
                <div className="py-16 text-center text-[15px]" style={{ color: subClr }}>
                  No students enrolled in this course.
                </div>
              ) : (
                <>
                  {/* Column headers */}
                  <div className="flex items-center gap-4 px-6 py-3 border-b text-[11px] font-bold uppercase tracking-widest"
                    style={{ borderColor: border, color: subClr, background: mutedBg }}>
                    <span className="w-6 text-center shrink-0">#</span>
                    <span className="w-9 shrink-0" />
                    <span className="flex-1">Student</span>
                    {/* Mark-all checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer shrink-0 w-24 justify-center" title="Mark all present">
                      <input
                        type="checkbox"
                        checked={allPresent}
                        onChange={markAllPresent}
                        className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                      />
                      <span>Present</span>
                    </label>
                    <span className="w-16 text-center shrink-0">Late</span>
                    <span className="w-48 shrink-0">Remarks</span>
                  </div>

                  <div className="divide-y" style={{ borderColor: border }}>
                    {attendance.map((s, i) => {
                      const isPresent = s.status !== 'absent';
                      const isLate    = s.status === 'late';
                      const rowBgClr  = !isPresent
                        ? (dark ? 'rgba(220,38,38,0.05)' : '#fff8f8')
                        : isLate
                          ? (dark ? 'rgba(202,138,4,0.05)' : '#fffdf0')
                          : 'transparent';
                      return (
                        <div key={s.student}
                          className="flex items-center gap-4 px-6 py-3.5 transition-colors"
                          style={{ background: rowBgClr }}>

                          <span className="text-[12px] font-bold w-6 text-center shrink-0" style={{ color: subClr }}>
                            {i + 1}
                          </span>

                          <Avatar name={s.name} index={i} size="sm" />

                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold" style={{ color: isPresent ? headClr : '#dc2626' }}>{s.name}</p>
                            <p className="text-[11px] mt-0.5 font-mono" style={{ color: subClr }}>{s.studentId}</p>
                          </div>

                          {/* Present checkbox */}
                          <div className="w-24 flex justify-center shrink-0">
                            <label className="flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isPresent}
                                onChange={() => togglePresent(s.student)}
                                className="w-5 h-5 rounded cursor-pointer accent-emerald-600"
                              />
                            </label>
                          </div>

                          {/* Late checkbox */}
                          <div className="w-16 flex justify-center shrink-0">
                            <label className={`flex items-center justify-center ${!isPresent ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}>
                              <input
                                type="checkbox"
                                checked={isLate}
                                disabled={!isPresent}
                                onChange={() => toggleLate(s.student)}
                                className="w-5 h-5 rounded cursor-pointer accent-amber-500"
                              />
                            </label>
                          </div>

                          {/* Remarks */}
                          <input
                            type="text"
                            value={s.remarks}
                            onChange={e => setRemarks(s.student, e.target.value)}
                            placeholder="Optional remark…"
                            className="w-48 shrink-0 px-3 py-1.5 rounded-lg text-[12px] border outline-none transition-all"
                            style={{ background: inputBg, borderColor: border, color: headClr }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Form footer */}
              {attendance.length > 0 && (
                <div className="px-8 py-5 border-t flex items-center justify-between gap-4"
                  style={{ borderColor: border, background: dark ? '#0a1818' : '#f0faf8' }}>
                  <p className="text-[13px]" style={{ color: subClr }}>
                    {presentCount} present · {absentCount} absent · {lateCount} late
                  </p>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={closePanel}
                      className="px-6 py-2.5 rounded-xl text-[14px] font-medium border transition-all hover:opacity-80"
                      style={{ borderColor: border, color: subClr, background: 'transparent' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      className="px-8 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #1E3535 0%, #2a4a4a 100%)', boxShadow: '0 4px 14px rgba(30,53,53,0.35)' }}>
                      {saving ? 'Saving…' : activePanel.mode === 'edit' ? 'Save Changes' : 'Submit Attendance'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ── Course Cards ──────────────────────────────── */}
        {!activePanel && <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-bold" style={{ color: headClr }}>Your Courses</h2>
              <p className="text-[12px] mt-0.5" style={{ color: subClr }}>Select a course to take or review attendance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((c, i) => {
              const accent = COURSE_ACCENTS[i % COURSE_ACCENTS.length];
              const stats  = courseStats(c._id);
              const isActive = activePanel?.courseId === c._id && activePanel?.mode === 'take';

              return (
                <div key={c._id}
                  className="rounded-2xl border overflow-hidden shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    background: cardBg,
                    borderColor: isActive ? accent : border,
                    boxShadow: isActive ? `0 0 0 2px ${accent}30, 0 4px 16px rgba(0,0,0,0.08)` : undefined,
                  }}>

                  {/* Accent bar */}
                  <div className="h-1" style={{ background: accent }} />

                  <div className="p-6">
                    {/* Course identity */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                        style={{ background: accent }}>
                        {c.code?.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="font-bold text-[15px] leading-snug" style={{ color: headClr }}>{c.name}</p>
                        <p className="text-[12px] font-mono mt-1" style={{ color: subClr }}>{c.code}</p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Users size={13} style={{ color: subClr }} />
                        <span className="text-[12px] font-medium" style={{ color: subClr }}>
                          {c.students?.length || 0} students
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} style={{ color: subClr }} />
                        <span className="text-[12px] font-medium" style={{ color: subClr }}>
                          {stats.classes} classes
                        </span>
                      </div>
                    </div>

                    {/* Attendance progress */}
                    {stats.classes > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: subClr }}>
                            Avg. Attendance
                          </span>
                          <span className="text-[12px] font-bold"
                            style={{ color: stats.avg >= 75 ? '#16a34a' : '#dc2626' }}>
                            {stats.avg}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: dark ? '#1a2828' : '#e2e8f0' }}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${stats.avg}%`,
                              background: stats.avg >= 75 ? '#16a34a' : stats.avg >= 50 ? '#ca8a04' : '#dc2626',
                            }} />
                        </div>
                      </div>
                    )}
                    {stats.classes === 0 && (
                      <div className="mb-5 h-9 flex items-center">
                        <span className="text-[12px]" style={{ color: subClr }}>No attendance recorded yet</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => isActive ? closePanel() : openTake(c)}
                        className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: isActive ? '#374151' : accent }}>
                        {isActive ? 'Close' : 'Take Attendance'}
                      </button>
                      <button
                        onClick={() => openSummary(c._id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
                        style={{ background: dark ? '#1a2828' : '#f1f5f9', color: dark ? '#a0aec0' : '#374151', border: `1px solid ${border}` }}>
                        <Eye size={14} />
                        Summary
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {courses.length === 0 && (
              <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border p-16 text-center"
                style={{ background: cardBg, borderColor: border }}>
                <BookOpen size={32} className="mx-auto mb-3 opacity-20" style={{ color: headClr }} />
                <p className="font-semibold" style={{ color: headClr }}>No courses assigned</p>
                <p className="text-sm mt-1" style={{ color: subClr }}>Contact admin to get courses assigned.</p>
              </div>
            )}
          </div>
        </div>}

        {/* ── Attendance History ────────────────────────── */}
        {!activePanel &&
        <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>

          {/* Section header */}
          <div className="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center gap-3"
            style={{ borderColor: border, background: mutedBg }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: dark ? '#1a2828' : '#e8f4f1' }}>
                <Clock size={16} style={{ color: '#1E3535' }} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold" style={{ color: headClr }}>Attendance History</h2>
                <p className="text-[11px]" style={{ color: subClr }}>{records.length} record{records.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="sm:ml-auto">
              <select value={filterCourse} onChange={e => setFilter(e.target.value)}
                className="px-4 py-2 rounded-xl text-[13px] border outline-none w-full sm:w-auto"
                style={{ background: inputBg, borderColor: border, color: headClr }}>
                <option value="">All Courses</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Column headers */}
          {records.length > 0 && (
            <div className="hidden sm:grid grid-cols-12 px-6 py-3 border-b text-[11px] font-bold uppercase tracking-widest"
              style={{ borderColor: border, color: subClr, background: mutedBg }}>
              <span className="col-span-1" />
              <span className="col-span-4">Course</span>
              <span className="col-span-3">Date</span>
              <span className="col-span-2 text-center">Present</span>
              <span className="col-span-1 text-center">Rate</span>
              <span className="col-span-1" />
            </div>
          )}

          <div className="divide-y" style={{ borderColor: border }}>
            {records.length === 0 && (
              <div className="py-16 text-center flex flex-col items-center gap-3" style={{ color: subClr }}>
                <CheckCircle size={32} className="opacity-15" />
                <div>
                  <p className="font-semibold text-[14px]">No records yet</p>
                  <p className="text-[12px] mt-0.5">Attendance records will appear here after submission.</p>
                </div>
              </div>
            )}

            {records.map(r => {
              const present    = r.records?.filter(x => x.status === 'present').length || 0;
              const total      = r.records?.length || 0;
              const p          = total > 0 ? Math.round((present / total) * 100) : 0;
              const isEditing  = activePanel?.mode === 'edit' && activePanel?.record?._id === r._id;
              const accentIdx  = courses.findIndex(c => c._id === r.course?._id);
              const rowAccent  = COURSE_ACCENTS[accentIdx % COURSE_ACCENTS.length] || '#1E3535';

              return (
                <div key={r._id}
                  className="group sm:grid sm:grid-cols-12 flex flex-wrap items-center gap-3 px-6 py-4 transition-colors"
                  style={{ background: isEditing ? (dark ? '#0c1c1c' : '#f0faf8') : 'transparent' }}
                  onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.02)' : '#f8fafc'; }}
                  onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = 'transparent'; }}>

                  {/* Color dot */}
                  <div className="sm:col-span-1 flex items-center">
                    <div className="w-2 h-2 rounded-full" style={{ background: rowAccent }} />
                  </div>

                  {/* Course name */}
                  <div className="sm:col-span-4 flex-1 min-w-0">
                    <p className="text-[14px] font-semibold truncate" style={{ color: headClr }}>{r.course?.name}</p>
                  </div>

                  {/* Date */}
                  <div className="sm:col-span-3">
                    <p className="text-[13px]" style={{ color: subClr }}>
                      {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Present count */}
                  <div className="sm:col-span-2 text-center">
                    <span className="text-[13px] font-semibold" style={{ color: headClr }}>{present} / {total}</span>
                  </div>

                  {/* Rate badge */}
                  <div className="sm:col-span-1 flex justify-center">
                    <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg"
                      style={{
                        background: p >= 75 ? (dark ? '#0a2018' : '#dcfce7') : (dark ? '#2a1010' : '#fee2e2'),
                        color: p >= 75 ? '#16a34a' : '#dc2626',
                      }}>{p}%</span>
                  </div>

                  {/* Edit button */}
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      onClick={() => isEditing ? closePanel() : openEdit(r)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                      style={{
                        background: isEditing ? (dark ? '#2a1010' : '#fee2e2') : (dark ? '#1a2828' : '#e8f4f1'),
                        color: isEditing ? '#dc2626' : '#1E3535',
                      }}>
                      {isEditing ? <X size={12} /> : <Edit2 size={12} />}
                      {isEditing ? 'Close' : 'Edit'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>}

      </div>

      {/* ── Summary Modal ─────────────────────────────── */}
      {showSummary && summary && (
        <Modal title={`Attendance Summary — ${summary.course?.name}`} onClose={() => setShowSummary(false)} size="lg">
          <div className="flex items-center gap-3 mb-5 p-4 rounded-xl border"
            style={{ background: dark ? '#0f1e1e' : '#f0faf8', borderColor: dark ? '#1e3535' : '#c0ddd6' }}>
            <UserCheck size={16} style={{ color: '#1E3535' }} />
            <span className="text-[13px] font-medium" style={{ color: headClr }}>
              Total classes held: <span className="font-bold">{summary.totalClasses}</span>
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: border }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: mutedBg }}>
                  {['Student', 'ID', 'Present', 'Absent', 'Late', 'Rate'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest border-b"
                      style={{ color: subClr, borderColor: border }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.summary?.map((s, i) => {
                  const p = parseFloat(pct(s));
                  return (
                    <tr key={s.student._id} className="border-b last:border-0 transition-colors"
                      style={{ borderColor: border }}
                      onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.02)' : '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={s.student.name} index={i} size="sm" />
                          <span className="font-semibold text-[13px]" style={{ color: headClr }}>{s.student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-mono" style={{ color: subClr }}>{s.student.studentId}</td>
                      <td className="px-4 py-3 font-bold text-emerald-500">{s.present}</td>
                      <td className="px-4 py-3 font-bold text-red-500">{s.absent}</td>
                      <td className="px-4 py-3 font-bold text-amber-500">{s.late}</td>
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg"
                          style={{
                            background: p >= 75 ? (dark ? '#0a2018' : '#dcfce7') : (dark ? '#2a1010' : '#fee2e2'),
                            color: p >= 75 ? '#16a34a' : '#dc2626',
                          }}>{pct(s)}%</span>
                        {p < 75 && <span className="ml-2 text-[11px] font-semibold text-red-400">⚠ Low</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
