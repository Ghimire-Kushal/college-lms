import { useState, useEffect } from 'react';
import { BookOpen, Users, ArrowLeft, GraduationCap, ClipboardList, FileText, UserCheck, Plus, Upload, Trash2, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FACULTY_META = {
  'Science':          { icon: '🔬', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  'Management':       { icon: '📊', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
  'Law':              { icon: '⚖️',  color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  'Computer Science': { icon: '💻', color: '#0891b2', bg: '#f0f9ff', border: '#bae6fd' },
  'Hotel Management': { icon: '🏨', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  'Humanities':       { icon: '📚', color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' },
  'Education':        { icon: '🎓', color: '#65a30d', bg: '#f7fee7', border: '#d9f99d' },
};

const TABS = [
  { key: 'students',    label: 'Students',    icon: Users },
  { key: 'attendance',  label: 'Attendance',  icon: UserCheck },
  { key: 'assignments', label: 'Assignments', icon: ClipboardList },
  { key: 'notes',       label: 'Notes',       icon: FileText },
];

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />;
}

/* ════════════════════════════════════════════════
   SUBJECT WORKSPACE
════════════════════════════════════════════════ */
function SubjectWorkspace({ course, meta, onBack }) {
  const [tab, setTab]               = useState('students');
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notes, setNotes]           = useState([]);
  const [attRecords, setAttRecords] = useState(
    (course.students || []).map(s => ({ student: s._id, name: s.name || s, status: 'present', remarks: '' }))
  );
  const [attDate, setAttDate]       = useState(new Date().toISOString().slice(0, 10));
  const [savingAtt, setSavingAtt]   = useState(false);
  const [aForm, setAForm]           = useState({ title: '', description: '', dueDate: '' });
  const [savingA, setSavingA]       = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [loading, setLoading]       = useState(false);

  useEffect(() => { loadTab(tab); }, [tab]);

  const loadTab = async (t) => {
    setLoading(true);
    try {
      if (t === 'attendance') {
        const r = await api.get('/teacher/attendance', { params: { courseId: course._id } });
        setAttendance(r.data);
      } else if (t === 'assignments') {
        const r = await api.get('/teacher/assignments', { params: { courseId: course._id } });
        setAssignments(r.data);
      } else if (t === 'notes') {
        const r = await api.get('/teacher/notes', { params: { courseId: course._id } });
        setNotes(r.data);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const submitAttendance = async () => {
    setSavingAtt(true);
    try {
      await api.post('/teacher/attendance', {
        courseId: course._id,
        date: attDate,
        records: attRecords.map(r => ({ student: r.student, status: r.status, remarks: r.remarks })),
      });
      toast.success('Attendance saved');
      loadTab('attendance');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingAtt(false); }
  };

  const createAssignment = async (e) => {
    e.preventDefault(); setSavingA(true);
    try {
      await api.post('/teacher/assignments', { ...aForm, courseId: course._id });
      toast.success('Assignment created');
      setAForm({ title: '', description: '', dueDate: '' });
      loadTab('assignments');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingA(false); }
  };

  const uploadNote = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('courseId', course._id);
    fd.append('title', file.name.replace(/\.[^/.]+$/, ''));
    setUploading(true);
    try {
      await api.post('/teacher/notes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Note uploaded');
      loadTab('notes');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const deleteNote = async (id) => {
    if (!confirm('Delete this note?')) return;
    await api.delete(`/teacher/notes/${id}`);
    toast.success('Deleted'); loadTab('notes');
  };

  const students = course.students || [];

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition font-medium">
          <ArrowLeft size={14} /> My Faculties
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-400">{course.stream}</span>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-800">{course.name}</span>
      </div>

      {/* Subject hero */}
      <div className="rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: meta.bg, borderColor: meta.border }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold bg-white border shadow-sm shrink-0"
          style={{ borderColor: meta.border, color: meta.color }}>
          {course.name[0]}
        </div>
        <div className="flex-1">
          <h2 className="text-[17px] font-bold text-slate-800">{course.name}</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">
            {course.code} &nbsp;·&nbsp; Class {course.grade} &nbsp;·&nbsp; {course.stream}
            {course.section ? ` · Section ${course.section}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-center px-4 py-2 rounded-xl border" style={{ borderColor: meta.border, background: 'white' }}>
            <p className="text-xl font-bold" style={{ color: meta.color }}>{students.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Students</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
            style={tab === key
              ? { background: '#fff', color: meta.color, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
              : { color: '#64748b' }
            }>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        {/* ── STUDENTS ── */}
        {tab === 'students' && (
          <div>
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-[13px] font-semibold text-slate-700">{students.length} enrolled students</p>
            </div>
            {students.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Users size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-[13px]">No students enrolled</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {students.map((s, i) => {
                  const colors = ['#2563eb','#059669','#7c3aed','#d97706','#0891b2','#db2777'];
                  const name = typeof s === 'string' ? s : s.name;
                  const rollNo = s.rollNo || '';
                  return (
                    <div key={s._id || i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                        style={{ background: colors[i % colors.length] }}>
                        {name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800">{name}</p>
                        {rollNo && <p className="text-[11px] text-slate-400">{rollNo}</p>}
                      </div>
                      <span className="text-[11px] text-slate-400">#{i + 1}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ATTENDANCE ── */}
        {tab === 'attendance' && (
          <div>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between"
              style={{ background: meta.bg }}>
              <div>
                <p className="text-[14px] font-bold text-slate-800">Take Attendance</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{course.name} · Class {course.grade} · {course.stream}</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Summary pills */}
                <span className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-100">
                  <CheckCircle size={13} /> {attRecords.filter(r => r.status === 'present').length} Present
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
                  <XCircle size={13} /> {attRecords.filter(r => r.status === 'absent').length} Absent
                </span>
              </div>
            </div>

            {/* Date selector */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 bg-white">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => setAttRecords(p => p.map(r => ({ ...r, status: 'present' })))}
                  className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition">
                  All Present
                </button>
                <button onClick={() => setAttRecords(p => p.map(r => ({ ...r, status: 'absent' })))}
                  className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition">
                  All Absent
                </button>
              </div>
            </div>

            {/* Student grid */}
            {attRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Users size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-[13px]">No students enrolled</p>
              </div>
            ) : (
              <>
                {/* Table header with Select All */}
                <div className="grid grid-cols-12 px-6 py-2.5 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  <div className="col-span-1">#</div>
                  <div className="col-span-9">Student</div>
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    {/* Select All checkbox */}
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <div
                        className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                        style={
                          attRecords.length > 0 && attRecords.every(r => r.status === 'present')
                            ? { background: '#059669', borderColor: '#059669' }
                            : attRecords.some(r => r.status === 'present')
                            ? { background: '#d1fae5', borderColor: '#059669' }
                            : { background: '#fff', borderColor: '#d1d5db' }
                        }
                        onClick={() => {
                          const allPresent = attRecords.every(r => r.status === 'present');
                          setAttRecords(p => p.map(r => ({ ...r, status: allPresent ? 'absent' : 'present' })));
                        }}
                      >
                        {attRecords.every(r => r.status === 'present') && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {attRecords.some(r => r.status === 'present') && !attRecords.every(r => r.status === 'present') && (
                          <svg width="9" height="9" viewBox="0 0 10 2" fill="none">
                            <path d="M1 1h8" stroke="#059669" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">Present</span>
                    </label>
                  </div>
                </div>

                <div className="divide-y divide-slate-50">
                  {attRecords.map((r, i) => {
                    const isPresent = r.status === 'present';
                    return (
                      <div
                        key={i}
                        className="grid grid-cols-12 items-center px-6 py-3.5 cursor-pointer transition-colors"
                        style={{ background: isPresent ? '#f0fdf4' : '#fef2f2' }}
                        onClick={() => setAttRecords(p => p.map((x, j) => j === i ? { ...x, status: isPresent ? 'absent' : 'present' } : x))}
                      >
                        <div className="col-span-1 text-[12px] font-bold text-slate-300">{i + 1}</div>

                        <div className="col-span-9 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                            style={{ background: isPresent ? '#059669' : '#dc2626' }}>
                            {r.name?.[0] || '?'}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-slate-800">{r.name}</p>
                            <p className="text-[11px] mt-0.5 font-medium" style={{ color: isPresent ? '#059669' : '#dc2626' }}>
                              {isPresent ? 'Present' : 'Absent'}
                            </p>
                          </div>
                        </div>

                        {/* Single checkbox */}
                        <div className="col-span-2 flex justify-center" onClick={e => e.stopPropagation()}>
                          <label className="flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isPresent}
                              onChange={() => setAttRecords(p => p.map((x, j) => j === i ? { ...x, status: isPresent ? 'absent' : 'present' } : x))}
                              className="sr-only"
                            />
                            <div
                              className="w-6 h-6 rounded border-2 flex items-center justify-center transition-all"
                              style={isPresent
                                ? { background: '#059669', borderColor: '#059669' }
                                : { background: '#fff', borderColor: '#fca5a5' }
                              }
                            >
                              {isPresent && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save button */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <p className="text-[12px] text-slate-500">
                    {attRecords.filter(r => r.status === 'present').length} of {attRecords.length} students present
                  </p>
                  <button onClick={submitAttendance} disabled={savingAtt}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
                    style={{ background: meta.color }}>
                    {savingAtt ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    {savingAtt ? 'Saving…' : 'Save Attendance'}
                  </button>
                </div>
              </>
            )}

            {/* Past records */}
            <div className="border-t border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <p className="text-[13px] font-semibold text-slate-700">Past Records</p>
              </div>
              {loading ? (
                <div className="p-6 space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : attendance.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <UserCheck size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-[13px]">No attendance records yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {attendance.slice(0, 10).map(r => {
                    const present = r.records?.filter(x => x.status === 'present').length || 0;
                    const total   = r.records?.length || 0;
                    const pct     = total > 0 ? Math.round((present / total) * 100) : 0;
                    return (
                      <div key={r._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                          style={{ background: pct >= 75 ? '#059669' : '#dc2626' }}>
                          {pct}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-slate-800">
                            {new Date(r.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{present} present · {total - present} absent · {total} total</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-green-50 text-green-700">{present} P</span>
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-600">{total - present} A</span>
                        </div>
                        {/* Progress bar */}
                        <div className="hidden sm:block w-20 shrink-0">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: pct >= 75 ? '#059669' : '#dc2626' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ASSIGNMENTS ── */}
        {tab === 'assignments' && (
          <div>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between"
              style={{ background: meta.bg }}>
              <div>
                <p className="text-[14px] font-bold text-slate-800">Assignments</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{course.name} · Class {course.grade}</p>
              </div>
              <div className="flex items-center gap-2 text-[12px]">
                <span className="px-3 py-1.5 rounded-lg font-semibold border"
                  style={{ background: meta.bg, borderColor: meta.border, color: meta.color }}>
                  {assignments.length} total
                </span>
              </div>
            </div>

            {/* Create form */}
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-4">New Assignment</p>
              <form onSubmit={createAssignment}>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  {/* Title */}
                  <input
                    required
                    value={aForm.title}
                    onChange={e => setAForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Assignment title…"
                    className="w-full px-5 py-4 text-[14px] font-semibold text-slate-800 placeholder-slate-400 border-b border-slate-100 focus:outline-none"
                  />
                  {/* Description */}
                  <textarea
                    value={aForm.description}
                    onChange={e => setAForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Description or instructions (optional)"
                    rows={3}
                    className="w-full px-5 py-3 text-[13px] text-slate-600 placeholder-slate-400 resize-none focus:outline-none"
                  />
                  {/* Footer row */}
                  <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-slate-400" />
                      <label className="text-[12px] font-medium text-slate-500 mr-1">Due date:</label>
                      <input
                        required
                        type="date"
                        value={aForm.dueDate}
                        onChange={e => setAForm(p => ({ ...p, dueDate: e.target.value }))}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={savingA}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-bold text-white transition disabled:opacity-50 hover:opacity-90"
                      style={{ background: meta.color }}
                    >
                      {savingA ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                      {savingA ? 'Creating…' : 'Create Assignment'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Assignment list */}
            <div className="p-6">
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-4">All Assignments</p>
              {loading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : assignments.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  <ClipboardList size={28} className="mb-2 opacity-40" />
                  <p className="text-[13px] font-medium">No assignments yet</p>
                  <p className="text-[12px] mt-1">Create one above to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((a, i) => {
                    const due      = new Date(a.dueDate);
                    const now      = new Date();
                    const overdue  = due < now;
                    const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                    const colors   = ['#2563eb','#059669','#7c3aed','#d97706','#0891b2'];
                    return (
                      <div key={a._id}
                        className="flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-sm"
                        style={{ borderColor: overdue ? '#fecaca' : '#e2e8f0', background: overdue ? '#fef9f9' : '#fff' }}
                      >
                        {/* Number badge */}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                          style={{ background: colors[i % colors.length] }}>
                          {i + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-slate-800">{a.title}</p>
                          {a.description && (
                            <p className="text-[12px] text-slate-500 mt-1 line-clamp-2">{a.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Users size={11} /> {students.length} students
                            </span>
                          </div>
                        </div>

                        {/* Due date badge */}
                        <div className="shrink-0 text-right">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold"
                            style={overdue
                              ? { background: '#fef2f2', color: '#dc2626' }
                              : daysLeft <= 3
                              ? { background: '#fffbeb', color: '#d97706' }
                              : { background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }
                            }>
                            <Clock size={12} />
                            {overdue
                              ? 'Overdue'
                              : daysLeft === 0
                              ? 'Due today'
                              : `${daysLeft}d left`}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1.5">
                            {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── NOTES ── */}
        {tab === 'notes' && (
          <div>
            {/* Upload */}
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <p className="text-[13px] font-semibold text-slate-700 mb-3">Upload Note / Material</p>
              <label className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 cursor-pointer transition-all w-fit">
                {uploading
                  ? <Loader2 size={16} className="animate-spin text-slate-400" />
                  : <Upload size={16} className="text-slate-400" />}
                <span className="text-[13px] font-medium text-slate-500">
                  {uploading ? 'Uploading…' : 'Choose file to upload'}
                </span>
                <input type="file" className="hidden" onChange={uploadNote} disabled={uploading} />
              </label>
            </div>

            {/* List */}
            <div className="p-5">
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Uploaded Notes</p>
              {loading ? <Skeleton className="h-20" /> : notes.length === 0 ? (
                <p className="text-[13px] text-slate-400 py-4 text-center">No notes uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {notes.map(n => (
                    <div key={n._id} className="flex items-center gap-3 p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 transition group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: meta.bg }}>
                        <FileText size={14} style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 truncate">{n.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      {n.fileUrl && (
                        <a href={n.fileUrl} target="_blank" rel="noreferrer"
                          className="text-[12px] font-semibold transition hover:opacity-70 shrink-0"
                          style={{ color: meta.color }}>
                          Download
                        </a>
                      )}
                      <button onClick={() => deleteNote(n._id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════════ */
export default function TeacherDashboard() {
  const { user }    = useAuth();
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);   // faculty name
  const [activeClass, setActiveClass] = useState(11);
  const [activeCourse, setActiveCourse] = useState(null); // subject detail

  useEffect(() => {
    api.get('/teacher/dashboard')
      .then(r => setCourses(r.data.courses || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const grouped = courses.reduce((acc, c) => {
    if (!acc[c.stream]) acc[c.stream] = { 11: [], 12: [] };
    (acc[c.stream][c.grade] = acc[c.stream][c.grade] || []).push(c);
    return acc;
  }, {});

  const totalStudents = courses.reduce((s, c) => s + (c.students?.length || 0), 0);
  const meta    = selected ? (FACULTY_META[selected] || { icon: '📖', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' }) : null;
  const byGrade = selected ? (grouped[selected] || {}) : {};
  const list    = byGrade[activeClass] || [];

  /* Subject workspace */
  if (activeCourse) {
    const courseMeta = FACULTY_META[activeCourse.stream] || { icon: '📖', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
    return <SubjectWorkspace course={activeCourse} meta={courseMeta} onBack={() => setActiveCourse(null)} />;
  }

  /* Faculty grid */
  if (!selected) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider">Teacher Portal</p>
              <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Hello, {user?.name?.split(' ')[0]}! 👋</h2>
              <p className="text-violet-200/70 text-sm mt-1">Canvas Academy Udayapur</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <p className="text-2xl font-bold text-white">{courses.length}</p>
                <p className="text-violet-200 text-[11px] font-medium mt-0.5">Subjects</p>
              </div>
              <div className="text-center px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <p className="text-2xl font-bold text-white">{totalStudents}</p>
                <p className="text-violet-200 text-[11px] font-medium mt-0.5">Students</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-slate-800">My Faculties</h2>
            <p className="text-[12px] text-slate-400">Click a faculty to view subjects</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-44" />)}
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center py-14 text-slate-400">
              <BookOpen size={32} className="mb-3 opacity-40" />
              <p className="text-[14px] font-medium">No subjects assigned yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(grouped).map(([stream, bg]) => {
                const m   = FACULTY_META[stream] || { icon: '📖', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
                const c11 = (bg[11] || []).length, c12 = (bg[12] || []).length;
                const studs = [...(bg[11] || []), ...(bg[12] || [])].reduce((s, c) => s + (c.students?.length || 0), 0);
                return (
                  <button key={stream}
                    onClick={() => { setSelected(stream); setActiveClass(c11 > 0 ? 11 : 12); }}
                    className="group border rounded-2xl p-5 text-left hover:shadow-lg transition-all"
                    style={{ borderColor: m.border, background: m.bg }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 bg-white border shadow-sm"
                      style={{ borderColor: m.border }}>{m.icon}</div>
                    <p className="text-[14px] font-bold" style={{ color: m.color }}>{stream}</p>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-slate-500">Class 11</span>
                        <span className="font-bold" style={{ color: m.color }}>{c11} subjects</span>
                      </div>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-slate-500">Class 12</span>
                        <span className="font-bold" style={{ color: m.color }}>{c12} subjects</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t flex items-center justify-between text-[12px]"
                      style={{ borderColor: m.border }}>
                      <span className="flex items-center gap-1 text-slate-500"><Users size={11} /> {studs}</span>
                      <span className="font-semibold opacity-0 group-hover:opacity-100 transition" style={{ color: m.color }}>Open →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* Faculty detail */
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 text-[13px]">
        <button onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition font-medium">
          <ArrowLeft size={14} /> My Faculties
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-xl">{meta.icon}</span>
        <span className="font-bold text-slate-800">{selected}</span>
      </div>

      <div className="rounded-2xl p-5 border flex items-center gap-4"
        style={{ background: meta.bg, borderColor: meta.border }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-white border shadow-sm"
          style={{ borderColor: meta.border }}>{meta.icon}</div>
        <div>
          <h2 className="text-[17px] font-bold text-slate-800">{selected}</h2>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Class 11: <strong style={{ color: meta.color }}>{(byGrade[11] || []).length}</strong> &nbsp;·&nbsp;
            Class 12: <strong style={{ color: meta.color }}>{(byGrade[12] || []).length}</strong> subjects
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {[11, 12].map(g => {
          const cnt = (byGrade[g] || []).length;
          return (
            <button key={g} onClick={() => setActiveClass(g)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all border"
              style={activeClass === g
                ? { background: meta.color, color: '#fff', borderColor: meta.color }
                : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }}>
              <GraduationCap size={14} /> Class {g}
              <span className="text-[11px] px-1.5 py-0.5 rounded-full"
                style={activeClass === g
                  ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                  : { background: '#f1f5f9', color: '#64748b' }}>
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {list.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <BookOpen size={28} className="mb-3 opacity-40" />
            <p className="text-[13px]">No subjects in Class {activeClass}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Subject</div>
              <div className="col-span-2">Code</div>
              <div className="col-span-2 text-center">Students</div>
              <div className="col-span-2 text-right">Action</div>
            </div>
            <div className="divide-y divide-slate-100">
              {list.map((c, i) => (
                <div key={c._id}
                  className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setActiveCourse(c)}
                >
                  <div className="col-span-1 text-center text-[12px] font-bold text-slate-300">{i + 1}</div>
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                      style={{ background: meta.color }}>{c.name[0]}</div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">{c.name}</p>
                      {c.description && <p className="text-[11px] text-slate-400 truncate">{c.description}</p>}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{c.code}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-1 text-[12px] text-slate-600">
                    <Users size={12} className="text-slate-400" /> {c.students?.length || 0}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-[12px] font-semibold opacity-0 group-hover:opacity-100 transition"
                      style={{ color: meta.color }}>Open →</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
