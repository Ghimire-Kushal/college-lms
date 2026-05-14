import { useState, useEffect } from 'react';
import { Plus, Eye, UserCheck, Edit2, Calendar, CheckCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, SecondaryBtn, FormField, PageHeader, inputCls, selectCls, Badge, Avatar } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

export default function TeacherAttendance() {
  const [courses, setCourses]       = useState([]);
  const [records, setRecords]       = useState([]);
  const [modal, setModal]           = useState(null);   // 'take' | 'edit' | 'summary'
  const [selectedCourse, setSelected] = useState('');
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary]       = useState(null);
  const [filterCourse, setFilter]   = useState('');
  const [editRecord, setEditRecord] = useState(null);
  const { dark } = useTheme();

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#ede8e4';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';

  const loadCourses = () => api.get('/teacher/courses').then(r => setCourses(r.data));
  const loadRecords = () => api.get('/teacher/attendance', { params: { courseId: filterCourse } }).then(r => setRecords(r.data));

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { loadRecords(); }, [filterCourse]);

  const openTake = async () => {
    if (!selectedCourse) return toast.error('Select a course first');
    const course = courses.find(c => c._id === selectedCourse);
    setAttendance(course?.students?.map(s => ({ student: s._id, status: 'present', name: s.name, studentId: s.studentId })) || []);
    setModal('take');
  };

  const openEdit = (record) => {
    setEditRecord(record);
    setAttendance(record.records.map(r => ({
      student: r.student._id,
      status: r.status,
      name: r.student.name,
      studentId: r.student.studentId,
    })));
    setDate(new Date(record.date).toISOString().split('T')[0]);
    setModal('edit');
  };

  const openSummary = async (courseId) => {
    const r = await api.get(`/teacher/attendance/summary/${courseId}`);
    setSummary(r.data);
    setModal('summary');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teacher/attendance', {
        courseId: selectedCourse,
        date,
        records: attendance.map(a => ({ student: a.student, status: a.status })),
      });
      toast.success('Attendance submitted');
      loadRecords(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/teacher/attendance/${editRecord._id}`, {
        date,
        records: attendance.map(a => ({ student: a.student, status: a.status })),
      });
      toast.success('Attendance updated');
      loadRecords(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const toggle = (id, status) => setAttendance(a => a.map(s => s.student === id ? { ...s, status } : s));
  const pct = (s) => s.total > 0 ? ((s.present + s.late * 0.5) / s.total * 100).toFixed(1) : 0;

  const statusBtn = (s, value, label, colors) => (
    <button type="button" onClick={() => toggle(s.student, value)}
      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${s.status === value ? colors.active : ''}`}
      style={s.status !== value ? { background: dark ? '#1a2828' : '#f0ebe8', color: subClr } : {}}>
      {label}
    </button>
  );

  const AttendanceForm = ({ onSubmit, title }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between p-3.5 rounded-xl border"
        style={{ background: dark ? '#0f1e1e' : '#f5faf7', borderColor: dark ? '#1e3535' : '#c8e8dc' }}>
        <span className="text-[13px] font-semibold" style={{ color: headClr }}>
          {modal === 'edit'
            ? records.find(r => r._id === editRecord?._id)?.course?.name || editRecord?.course?.name
            : courses.find(c => c._id === selectedCourse)?.name}
        </span>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="text-[12px] border rounded-lg px-2.5 py-1 outline-none"
          style={{ background: dark ? '#131e1e' : '#fff', borderColor: border, color: headClr }} />
      </div>

      <div className="flex gap-2 text-[11px] font-semibold pb-1" style={{ color: subClr }}>
        <span className="flex-1">Student</span>
        <span className="w-8 text-center text-emerald-500">P</span>
        <span className="w-8 text-center text-rose-500">A</span>
        <span className="w-8 text-center text-amber-500">L</span>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {attendance.map((s, i) => (
          <div key={s.student} className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
            style={{ background: dark ? '#0f1e1e' : '#faf7f5', borderColor: border }}>
            <Avatar name={s.name} index={i} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate" style={{ color: headClr }}>{s.name}</p>
              <p className="text-[11px]" style={{ color: subClr }}>{s.studentId}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              {statusBtn(s, 'present', 'P', { active: 'bg-emerald-500 text-white' })}
              {statusBtn(s, 'absent',  'A', { active: 'bg-rose-500 text-white' })}
              {statusBtn(s, 'late',    'L', { active: 'bg-amber-500 text-white' })}
            </div>
          </div>
        ))}
        {attendance.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: subClr }}>No students enrolled</p>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t" style={{ borderColor: border }}>
        <SecondaryBtn type="button" onClick={() => setModal(null)}>Cancel</SecondaryBtn>
        <PrimaryBtn type="submit">{title}</PrimaryBtn>
      </div>
    </form>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Attendance" subtitle="Take attendance and review class records." />

      {/* Take Attendance panel */}
      <div className="rounded-2xl p-5 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
        <h3 className="text-[14px] font-semibold mb-4" style={{ color: headClr }}>Take New Attendance</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <FormField label="Course">
            <select value={selectedCourse} onChange={e => setSelected(e.target.value)}
              className={`${selectCls} min-w-48`}
              style={{ background: dark ? '#0f1e1e' : '#fff', borderColor: border, color: headClr }}>
              <option value="">Select a course...</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </FormField>
          <FormField label="Date">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className={inputCls}
              style={{ background: dark ? '#0f1e1e' : '#fff', borderColor: border, color: headClr }} />
          </FormField>
          <PrimaryBtn onClick={openTake} disabled={!selectedCourse} className="self-end">
            <Plus size={15} /> Take Attendance
          </PrimaryBtn>
        </div>
      </div>

      {/* Course summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map((c, i) => {
          const colors = ['#8B3030','#1E3535','#b87a00','#2a6648'];
          return (
            <div key={c._id} className="rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md"
              style={{ background: cardBg, borderColor: border }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: colors[i % colors.length] }}>
                    {c.code?.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px]" style={{ color: headClr }}>{c.name}</h3>
                    <p className="text-[11px]" style={{ color: subClr }}>{c.code}</p>
                  </div>
                </div>
                <button onClick={() => openSummary(c._id)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl transition-colors"
                  style={{ background: dark ? '#1a2828' : '#edf7f5', color: '#1E3535' }}>
                  <Eye size={12} /> Summary
                </button>
              </div>
              <p className="text-[12px]" style={{ color: subClr }}>{c.students?.length || 0} students enrolled</p>
            </div>
          );
        })}
      </div>

      {/* Attendance History */}
      <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
        <div className="px-5 py-4 border-b flex flex-wrap items-center gap-3" style={{ borderColor: border }}>
          <div className="flex items-center gap-2">
            <Calendar size={15} style={{ color: '#1E3535' }} />
            <span className="text-[14px] font-semibold" style={{ color: headClr }}>Attendance History</span>
          </div>
          <select value={filterCourse} onChange={e => setFilter(e.target.value)}
            className="ml-auto px-3 py-1.5 rounded-xl text-[12px] border outline-none"
            style={{ background: dark ? '#0f1e1e' : '#f8f5f3', borderColor: border, color: headClr }}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="divide-y" style={{ borderColor: border }}>
          {records.length === 0 && (
            <div className="flex items-center gap-3 px-5 py-10 justify-center" style={{ color: subClr }}>
              <UserCheck size={20} className="opacity-30" />
              <p className="text-sm">No attendance records yet</p>
            </div>
          )}
          {records.map(r => {
            const presentCount = r.records?.filter(x => x.status === 'present').length || 0;
            const total = r.records?.length || 0;
            const p = total > 0 ? Math.round((presentCount / total) * 100) : 0;
            return (
              <div key={r._id} className="flex items-center gap-4 px-5 py-3.5 group transition-colors"
                style={{ borderColor: border }}
                onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: dark ? '#0f1e1e' : '#edf7f5' }}>
                  <CheckCircle size={14} style={{ color: '#1E3535' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: headClr }}>{r.course?.name}</p>
                  <p className="text-[11px]" style={{ color: subClr }}>
                    {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0 mr-2">
                  <p className="text-[13px] font-semibold" style={{ color: headClr }}>{presentCount}/{total}</p>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: p >= 75 ? (dark ? '#0f2518' : '#dcfce7') : (dark ? '#2a1414' : '#fee2e2'),
                      color: p >= 75 ? '#059669' : '#dc2626',
                    }}>{p}%</span>
                </div>
                <button onClick={() => openEdit(r)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all"
                  style={{ color: subClr }}
                  onMouseEnter={e => { e.currentTarget.style.background = dark ? '#1a2828' : '#edf7f5'; e.currentTarget.style.color = '#1E3535'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = subClr; }}
                  title="Edit attendance">
                  <Edit2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Take Attendance Modal */}
      {modal === 'take' && (
        <Modal title="Take Attendance" onClose={() => setModal(null)} size="lg">
          <AttendanceForm onSubmit={handleSubmit} title="Submit Attendance" />
        </Modal>
      )}

      {/* Edit Attendance Modal */}
      {modal === 'edit' && (
        <Modal title="Edit Attendance Record" onClose={() => setModal(null)} size="lg">
          <AttendanceForm onSubmit={handleEditSubmit} title="Save Changes" />
        </Modal>
      )}

      {/* Summary Modal */}
      {modal === 'summary' && summary && (
        <Modal title={`Summary — ${summary.course?.name}`} onClose={() => setModal(null)} size="lg">
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
