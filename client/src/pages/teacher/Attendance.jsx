import { useState, useEffect } from 'react';
import { UserCheck, Eye, Edit2, Calendar, CheckCircle, X, ChevronDown, BarChart2, Clock, Users } from 'lucide-react';
import Modal from '../../components/Modal';
import { Avatar } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const courseColors = ['#8B3030', '#1E3535', '#b87a00', '#2a5080', '#5a2a80'];

export default function TeacherAttendance() {
  const [courses, setCourses]         = useState([]);
  const [records, setRecords]         = useState([]);
  const [activePanel, setActivePanel] = useState(null); // { courseId, mode: 'take'|'edit', record? }
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance]   = useState([]);
  const [saving, setSaving]           = useState(false);
  const [summary, setSummary]         = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [filterCourse, setFilter]     = useState('');
  const { dark } = useTheme();

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#ede8e4';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';
  const rowBg   = dark ? '#0f1e1e' : '#faf7f5';

  const loadCourses = () => api.get('/teacher/courses').then(r => setCourses(r.data));
  const loadRecords = () => api.get('/teacher/attendance', { params: { courseId: filterCourse } }).then(r => setRecords(r.data));

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { loadRecords(); }, [filterCourse]);

  const openTake = (course) => {
    setDate(new Date().toISOString().split('T')[0]);
    setAttendance(
      course.students?.map(s => ({ student: s._id, status: 'present', name: s.name, studentId: s.studentId })) || []
    );
    setActivePanel({ courseId: course._id, courseName: course.name, mode: 'take' });
  };

  const openEdit = (record) => {
    setActivePanel({
      courseId: record.course?._id,
      courseName: record.course?.name,
      mode: 'edit',
      record,
    });
    setAttendance(record.records.map(r => ({
      student: r.student._id,
      status: r.status,
      name: r.student.name,
      studentId: r.student.studentId,
    })));
    setDate(new Date(record.date).toISOString().split('T')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closePanel = () => { setActivePanel(null); setAttendance([]); };

  const openSummary = async (courseId) => {
    const r = await api.get(`/teacher/attendance/summary/${courseId}`);
    setSummary(r.data);
    setShowSummary(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/teacher/attendance', {
        courseId: activePanel.courseId,
        date,
        records: attendance.map(a => ({ student: a.student, status: a.status })),
      });
      toast.success('Attendance submitted');
      loadRecords();
      closePanel();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/teacher/attendance/${activePanel.record._id}`, {
        date,
        records: attendance.map(a => ({ student: a.student, status: a.status })),
      });
      toast.success('Attendance updated');
      loadRecords();
      closePanel();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const toggle = (id, status) => setAttendance(a => a.map(s => s.student === id ? { ...s, status } : s));

  const pct = (s) => s.total > 0 ? ((s.present + s.late * 0.5) / s.total * 100).toFixed(1) : 0;

  const presentCount = attendance.filter(s => s.status === 'present').length;
  const absentCount  = attendance.filter(s => s.status === 'absent').length;
  const lateCount    = attendance.filter(s => s.status === 'late').length;

  const totalClasses = records.length;
  const avgPct = records.length > 0
    ? Math.round(records.reduce((acc, r) => {
        const p = r.records?.filter(x => x.status === 'present').length || 0;
        const t = r.records?.length || 1;
        return acc + (p / t) * 100;
      }, 0) / records.length)
    : 0;

  return (
    <div className="space-y-5">

      {/* ── Banner ── */}
      <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1a1a 0%, #1E3535 55%, #2a4a4a 100%)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F2C04E 0%, transparent 70%)', opacity: 0.15 }} />
        <div>
          <p className="text-[#F2C04E] text-xs font-semibold uppercase tracking-wider">Teacher Portal</p>
          <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Attendance</h2>
          <p className="text-white/50 text-sm mt-1">Select a course below to take or review attendance.</p>
        </div>
        <div className="flex gap-3 mt-4 flex-wrap">
          {[
            { l: 'Total Classes', v: totalClasses, icon: Calendar },
            { l: 'Avg Attendance', v: `${avgPct}%`, icon: BarChart2 },
            { l: 'Courses', v: courses.length, icon: Users },
          ].map(({ l, v, icon: Icon }) => (
            <div key={l} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <Icon size={14} style={{ color: '#F2C04E' }} />
              <span className="text-lg font-bold text-white">{v}</span>
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Inline Attendance Panel ── */}
      {activePanel && (
        <div className="rounded-2xl border shadow-sm overflow-hidden"
          style={{ background: cardBg, borderColor: border }}>

          {/* Panel header */}
          <div className="px-8 py-5 border-b flex items-center justify-between"
            style={{ borderColor: border, background: dark ? '#0f1e1e' : '#f5faf7' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: dark ? '#1a2828' : '#dff0eb' }}>
                <UserCheck size={22} style={{ color: '#1E3535' }} />
              </div>
              <div>
                <p className="text-[19px] font-bold" style={{ color: headClr }}>
                  {activePanel.mode === 'edit' ? 'Edit Attendance' : 'Take Attendance'}
                </p>
                <p className="text-[13px] mt-0.5" style={{ color: subClr }}>{activePanel.courseName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
                style={{ background: dark ? '#0f1e1e' : '#fff', borderColor: border }}>
                <Calendar size={15} style={{ color: subClr }} />
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="outline-none bg-transparent text-[14px]"
                  style={{ color: headClr }} />
              </div>
              <button onClick={closePanel}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                style={{ background: dark ? '#1a2828' : '#f0ebe8', color: subClr }}>
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Quick summary row */}
          <div className="px-8 py-4 border-b flex items-center gap-5 flex-wrap"
            style={{ borderColor: border, background: dark ? '#0c1818' : '#fafbfc' }}>
            <span className="text-[13px] font-semibold" style={{ color: subClr }}>
              {attendance.length} students
            </span>
            <div className="flex items-center gap-2 ml-auto flex-wrap gap-y-1">
              <span className="px-3.5 py-1.5 rounded-full text-[13px] font-bold" style={{ background: dark ? '#0f2518' : '#dcfce7', color: '#059669' }}>
                {presentCount} Present
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-[13px] font-bold" style={{ background: dark ? '#2a1414' : '#fee2e2', color: '#dc2626' }}>
                {absentCount} Absent
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-[13px] font-bold" style={{ background: dark ? '#2a1a00' : '#fef3c7', color: '#d97706' }}>
                {lateCount} Late
              </span>
            </div>
          </div>

          {/* Student list */}
          <form onSubmit={activePanel.mode === 'edit' ? handleEditSubmit : handleSubmit}>
            <div className="divide-y" style={{ borderColor: border }}>
              {attendance.length === 0 && (
                <div className="py-14 text-center text-[15px]" style={{ color: subClr }}>No students enrolled in this course</div>
              )}
              {attendance.map((s, i) => (
                <div key={s.student} className="flex items-center gap-5 px-8 py-4 transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.02)' : '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Avatar name={s.name} index={i} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold" style={{ color: headClr }}>{s.name}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: subClr }}>{s.studentId}</p>
                  </div>
                  {/* Status buttons */}
                  <div className="flex gap-2.5 shrink-0">
                    {[
                      { val: 'present', label: 'Present', short: 'P', activeStyle: { background: '#059669', color: '#fff' } },
                      { val: 'absent',  label: 'Absent',  short: 'A', activeStyle: { background: '#dc2626', color: '#fff' } },
                      { val: 'late',    label: 'Late',    short: 'L', activeStyle: { background: '#d97706', color: '#fff' } },
                    ].map(({ val, label, short, activeStyle }) => (
                      <button key={val} type="button"
                        onClick={() => toggle(s.student, val)}
                        title={label}
                        className="w-12 h-10 rounded-xl text-[14px] font-bold transition-all"
                        style={s.status === val
                          ? activeStyle
                          : { background: dark ? '#1a2828' : '#f0ebe8', color: subClr }}>
                        {short}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            {attendance.length > 0 && (
              <div className="px-8 py-5 border-t flex items-center justify-end gap-3"
                style={{ borderColor: border, background: dark ? '#0f1e1e' : '#faf7f5' }}>
                <button type="button" onClick={closePanel}
                  className="px-6 py-3 rounded-xl text-[14px] font-medium border transition-all hover:opacity-80"
                  style={{ borderColor: border, color: subClr }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-8 py-3 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #1E3535, #2a4a4a)', boxShadow: '0 4px 12px rgba(30,53,53,0.35)' }}>
                  {saving ? 'Saving…' : activePanel.mode === 'edit' ? 'Save Changes' : 'Submit Attendance'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── Course Cards ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: subClr }}>
          Your Courses — click to take attendance
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((c, i) => {
            const color = courseColors[i % courseColors.length];
            const isActive = activePanel?.courseId === c._id;
            return (
              <div key={c._id}
                className="rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md"
                style={{
                  background: cardBg, borderColor: isActive ? color : border,
                  boxShadow: isActive ? `0 0 0 2px ${color}40` : undefined,
                }}>
                {/* Color bar */}
                <div className="h-2" style={{ background: color }} />
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: color }}>
                      {c.code?.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[15px] truncate" style={{ color: headClr }}>{c.name}</p>
                      <p className="text-[12px] font-mono mt-1" style={{ color: subClr }}>{c.code}</p>
                    </div>
                  </div>
                  <p className="text-[13px] mb-5" style={{ color: subClr }}>
                    {c.students?.length || 0} student{c.students?.length !== 1 ? 's' : ''} enrolled
                  </p>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => isActive ? closePanel() : openTake(c)}
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all"
                      style={{ background: isActive ? '#555' : color }}>
                      {isActive ? 'Close' : 'Take Attendance'}
                    </button>
                    <button
                      onClick={() => openSummary(c._id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                      style={{ background: dark ? '#1a2828' : '#edf7f5', color: '#1E3535' }}>
                      <Eye size={14} /> Summary
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {courses.length === 0 && (
            <div className="sm:col-span-2 xl:col-span-3 rounded-2xl p-12 text-center border"
              style={{ background: cardBg, borderColor: border }}>
              <p className="text-sm" style={{ color: subClr }}>No courses assigned yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Attendance History ── */}
      <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
        <div className="px-6 py-5 border-b flex flex-wrap items-center gap-3"
          style={{ borderColor: border, background: dark ? '#0f1e1e' : '#faf7f5' }}>
          <div className="flex items-center gap-2">
            <Clock size={16} style={{ color: '#1E3535' }} />
            <span className="text-[15px] font-semibold" style={{ color: headClr }}>Attendance History</span>
          </div>
          <select value={filterCourse} onChange={e => setFilter(e.target.value)}
            className="ml-auto px-4 py-2 rounded-xl text-[13px] border outline-none"
            style={{ background: dark ? '#0f1e1e' : '#fff', borderColor: border, color: headClr }}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="divide-y" style={{ borderColor: border }}>
          {records.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center gap-2" style={{ color: subClr }}>
              <CheckCircle size={28} className="opacity-20" />
              <p className="text-sm">No attendance records yet</p>
            </div>
          )}
          {records.map(r => {
            const present = r.records?.filter(x => x.status === 'present').length || 0;
            const total   = r.records?.length || 0;
            const p       = total > 0 ? Math.round((present / total) * 100) : 0;
            const isEditing = activePanel?.mode === 'edit' && activePanel?.record?._id === r._id;
            return (
              <div key={r._id}
                className="flex items-center gap-5 px-6 py-4 group transition-colors"
                style={{ background: isEditing ? (dark ? '#0c1c1c' : '#f5faf7') : 'transparent' }}
                onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.02)' : '#fafafa'; }}
                onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = 'transparent'; }}>

                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: dark ? '#0f1e1e' : '#edf7f5' }}>
                  <CheckCircle size={16} style={{ color: '#1E3535' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold" style={{ color: headClr }}>{r.course?.name}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: subClr }}>
                    {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[13px] font-semibold" style={{ color: headClr }}>{present}/{total}</span>
                  <span className="text-[12px] font-bold px-3 py-1 rounded-full"
                    style={{
                      background: p >= 75 ? (dark ? '#0f2518' : '#dcfce7') : (dark ? '#2a1414' : '#fee2e2'),
                      color: p >= 75 ? '#059669' : '#dc2626',
                    }}>{p}%</span>
                </div>

                <button onClick={() => isEditing ? closePanel() : openEdit(r)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all"
                  style={{
                    background: isEditing ? (dark ? '#2a1414' : '#fee2e2') : (dark ? '#1a2828' : '#edf7f5'),
                    color: isEditing ? '#dc2626' : '#1E3535',
                  }}>
                  {isEditing ? <X size={12} /> : <Edit2 size={12} />}
                  {isEditing ? 'Close' : 'Edit'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Summary Modal ── */}
      {showSummary && summary && (
        <Modal title={`Summary — ${summary.course?.name}`} onClose={() => setShowSummary(false)} size="lg">
          <div className="flex items-center gap-3 mb-4 p-3.5 rounded-xl border"
            style={{ background: dark ? '#0f1e1e' : '#edf7f5', borderColor: dark ? '#1e3535' : '#c8e8dc' }}>
            <UserCheck size={15} style={{ color: '#1E3535' }} />
            <span className="text-[13px]" style={{ color: headClr }}>
              Total classes held: <span className="font-bold">{summary.totalClasses}</span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: border }}>
                  {['Student', 'ID', 'Present', 'Absent', 'Late', 'Attendance %'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: subClr }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.summary?.map((s, i) => {
                  const p = parseFloat(pct(s));
                  return (
                    <tr key={s.student._id} className="border-b last:border-0 transition-colors"
                      style={{ borderColor: border }}
                      onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.02)' : '#f8f5f3'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={s.student.name} index={i} size="sm" />
                          <span className="font-semibold text-[13px]" style={{ color: headClr }}>{s.student.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[12px]" style={{ color: subClr }}>{s.student.studentId}</td>
                      <td className="px-3 py-2.5 font-bold text-emerald-500">{s.present}</td>
                      <td className="px-3 py-2.5 font-bold text-rose-500">{s.absent}</td>
                      <td className="px-3 py-2.5 font-bold text-amber-500">{s.late}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: p >= 75 ? (dark ? '#0f2518' : '#dcfce7') : (dark ? '#2a1414' : '#fee2e2'),
                            color: p >= 75 ? '#059669' : '#dc2626',
                          }}>{pct(s)}%</span>
                        {p < 75 && <span className="ml-1.5 text-[10px] font-medium text-rose-400">⚠ Low</span>}
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
