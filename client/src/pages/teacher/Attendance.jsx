import { useState, useEffect } from 'react';
import { Plus, Eye, UserCheck } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, SecondaryBtn, FormField, PageHeader, inputCls, selectCls, Badge, Avatar } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function TeacherAttendance() {
  const [courses, setCourses]         = useState([]);
  const [records, setRecords]         = useState([]);
  const [modal, setModal]             = useState(null);
  const [selectedCourse, setSelected] = useState('');
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance]   = useState([]);
  const [summary, setSummary]         = useState(null);
  const [filterCourse, setFilter]     = useState('');

  const loadCourses  = () => api.get('/teacher/courses').then(r => setCourses(r.data));
  const loadRecords  = () => api.get('/teacher/attendance', { params: { courseId: filterCourse } }).then(r => setRecords(r.data));

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { loadRecords(); }, [filterCourse]);

  const openTake = async () => {
    if (!selectedCourse) return toast.error('Select a course first');
    const course = courses.find(c => c._id === selectedCourse);
    setAttendance(course?.students?.map(s => ({ student: s._id, status: 'present', name: s.name, studentId: s.studentId })) || []);
    setModal('take');
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

  const toggle = (id, status) => setAttendance(a => a.map(s => s.student === id ? { ...s, status } : s));

  const pct = (s) => s.total > 0 ? ((s.present + s.late * 0.5) / s.total * 100).toFixed(1) : 0;

  const statusBtn = (s, value, label, colors) => (
    <button type="button" onClick={() => toggle(s.student, value)}
      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${s.status === value ? colors.active : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Attendance" subtitle="Take attendance and review class records." />
      {/* Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="text-[14px] font-semibold text-slate-700 mb-4">Take Attendance</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <FormField label="Course">
            <select value={selectedCourse} onChange={e => setSelected(e.target.value)} className={`${selectCls} min-w-48`}>
              <option value="">Select a course...</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </FormField>
          <FormField label="Date">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
          </FormField>
          <PrimaryBtn onClick={openTake} disabled={!selectedCourse} className="self-end">
            <Plus size={15} /> Take Attendance
          </PrimaryBtn>
        </div>
      </div>

      {/* Course cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map((c) => (
          <div key={c._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-sky-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-slate-800 text-[14px]">{c.name}</h3>
                <Badge color="indigo">{c.code}</Badge>
              </div>
              <button onClick={() => openSummary(c._id)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors">
                <Eye size={12} /> Summary
              </button>
            </div>
            <p className="text-[12px] text-slate-400 mt-2">{c.students?.length || 0} students enrolled</p>
          </div>
        ))}
      </div>

      {/* Records */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <span className="text-[14px] font-semibold text-slate-700">Attendance History</span>
          <select value={filterCourse} onChange={e => setFilter(e.target.value)}
            className="ml-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="divide-y divide-slate-50">
          {records.length === 0 && (
            <div className="flex items-center gap-3 px-5 py-8 text-slate-300">
              <UserCheck size={20} />
              <p className="text-sm">No attendance records yet</p>
            </div>
          )}
          {records.map(r => {
            const presentCount = r.records?.filter(x => x.status === 'present').length || 0;
            const total = r.records?.length || 0;
            const p = total > 0 ? Math.round((presentCount / total) * 100) : 0;
            return (
              <div key={r._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-700">{r.course?.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-semibold text-slate-700">{presentCount}/{total}</p>
                  <Badge color={p >= 75 ? 'green' : 'red'}>{p}%</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Take Attendance Modal */}
      {modal === 'take' && (
        <Modal title="Take Attendance" onClose={() => setModal(null)} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-[13px]">
              <span className="font-semibold text-slate-700">{courses.find(c => c._id === selectedCourse)?.name}</span>
              <Badge color="indigo">{date}</Badge>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {attendance.map((s, i) => (
                <div key={s.student} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                  <Avatar name={s.name} index={i} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700 truncate">{s.name}</p>
                    <p className="text-[11px] text-slate-400">{s.studentId}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {statusBtn(s, 'present', 'P', { active: 'bg-emerald-100 text-emerald-700' })}
                    {statusBtn(s, 'absent',  'A', { active: 'bg-rose-100 text-rose-700' })}
                    {statusBtn(s, 'late',    'L', { active: 'bg-amber-100 text-amber-700' })}
                  </div>
                </div>
              ))}
              {attendance.length === 0 && (
                <p className="text-center py-6 text-slate-400 text-sm">No students enrolled in this course</p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <SecondaryBtn type="button" onClick={() => setModal(null)}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit">Submit Attendance</PrimaryBtn>
            </div>
          </form>
        </Modal>
      )}

      {/* Summary Modal */}
      {modal === 'summary' && summary && (
        <Modal title={`Attendance Summary — ${summary.course?.name}`} onClose={() => setModal(null)} size="lg">
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <UserCheck size={16} className="text-indigo-500" />
            <span className="text-[13px] text-slate-600">
              Total classes held: <span className="font-bold text-slate-800">{summary.totalClasses}</span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Student', 'ID', 'Present', 'Absent', 'Late', 'Attendance %'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.summary?.map((s, i) => {
                  const p = parseFloat(pct(s));
                  return (
                    <tr key={s.student._id} className="border-b border-slate-50 hover:bg-slate-50/40 last:border-0">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={s.student.name} index={i} size="sm" />
                          <span className="font-semibold text-slate-700 text-[13px]">{s.student.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-400 text-[12px]">{s.student.studentId}</td>
                      <td className="px-3 py-2.5 font-semibold text-emerald-600">{s.present}</td>
                      <td className="px-3 py-2.5 font-semibold text-rose-500">{s.absent}</td>
                      <td className="px-3 py-2.5 font-semibold text-amber-600">{s.late}</td>
                      <td className="px-3 py-2.5">
                        <Badge color={p >= 75 ? 'green' : 'red'}>{pct(s)}%</Badge>
                        {p < 75 && <span className="ml-1.5 text-[10px] text-rose-400 font-medium">⚠ Low</span>}
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
