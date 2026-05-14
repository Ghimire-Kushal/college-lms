import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Award, Clock, CheckCircle, ClipboardList, BookOpen, Calendar, Hash } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, SecondaryBtn, FormField, ModalActions, Avatar, inputCls, selectCls } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const emptyForm = { title: '', description: '', courseId: '', dueDate: '', totalMarks: 100 };

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses]         = useState([]);
  const [modal, setModal]             = useState(null);
  const [form, setForm]               = useState(emptyForm);
  const [selected, setSelected]       = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradeForm, setGradeForm]     = useState({ marks: '', feedback: '' });
  const [selectedSub, setSelectedSub] = useState(null);
  const { dark } = useTheme();

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#ede8e4';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';

  const load = () => api.get('/teacher/assignments').then(r => setAssignments(r.data));
  useEffect(() => { load(); api.get('/teacher/courses').then(r => setCourses(r.data)); }, []);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };

  const openSubmissions = async (a) => {
    setSelected(a);
    const r = await api.get(`/teacher/assignments/${a._id}/submissions`);
    setSubmissions(r.data);
    setModal('submissions');
  };

  const openGrade = (sub) => {
    setSelectedSub(sub);
    setGradeForm({ marks: sub.marks || '', feedback: sub.feedback || '' });
    setModal('grade');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await api.post('/teacher/assignments', fd);
      toast.success('Assignment created');
      load(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    await api.patch(`/teacher/submissions/${selectedSub._id}/grade`, gradeForm);
    toast.success('Graded!');
    const r = await api.get(`/teacher/assignments/${selected._id}/submissions`);
    setSubmissions(r.data);
    setModal('submissions');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    await api.delete(`/teacher/assignments/${id}`);
    toast.success('Deleted'); load();
  };

  const f  = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const isPast = (d) => new Date(d) < new Date();

  const active   = assignments.filter(a => !isPast(a.dueDate));
  const closed   = assignments.filter(a =>  isPast(a.dueDate));

  const AssignmentCard = ({ a }) => {
    const past = isPast(a.dueDate);
    const due  = new Date(a.dueDate);
    const daysLeft = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
    const courseIdx = courses.findIndex(c => c._id === (a.course?._id || a.course));

    return (
      <div className="rounded-2xl border shadow-sm transition-all hover:shadow-md group"
        style={{ background: cardBg, borderColor: border }}>
        {/* Top strip */}
        <div className="h-1 rounded-t-2xl"
          style={{ background: past ? '#6e7681' : 'linear-gradient(90deg, #8B3030, #6b2525)' }} />

        <div className="p-5 flex items-start gap-4">
          {/* Icon */}
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{ background: past ? (dark ? '#1a1a1a' : '#f5f5f5') : (dark ? '#1a1414' : '#fef0f0') }}>
            {past
              ? <Clock size={18} style={{ color: subClr }} />
              : <CheckCircle size={18} style={{ color: '#8B3030' }} />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="font-bold text-[14px]" style={{ color: headClr }}>{a.title}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={past
                  ? { background: dark ? '#1a1a1a' : '#f0f0f0', color: subClr }
                  : { background: dark ? '#1a1414' : '#fef0f0', color: '#8B3030' }}>
                {past ? 'Closed' : 'Active'}
              </span>
            </div>

            {a.description && (
              <p className="text-[12px] mb-2 line-clamp-1" style={{ color: subClr }}>{a.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              {/* Course chip */}
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full font-medium"
                style={{ background: dark ? '#1a2828' : '#edf7f5', color: '#1E3535' }}>
                <BookOpen size={10} />
                {a.course?.name || courses[courseIdx]?.name}
              </span>
              {/* Due */}
              <span className="flex items-center gap-1" style={{ color: subClr }}>
                <Calendar size={10} />
                {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                {' '}
                {due.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {/* Marks */}
              <span className="flex items-center gap-1" style={{ color: subClr }}>
                <Hash size={10} /> {a.totalMarks} marks
              </span>
              {/* Days left (only if active) */}
              {!past && daysLeft <= 7 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: daysLeft <= 2 ? (dark ? '#2a1414' : '#fef0f0') : (dark ? '#1a2828' : '#f0fdf4'),
                           color: daysLeft <= 2 ? '#8B3030' : '#059669' }}>
                  {daysLeft <= 0 ? 'Due today' : `${daysLeft}d left`}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => openSubmissions(a)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-xl transition-all hover:opacity-80"
              style={{ background: dark ? '#1a2828' : '#edf7f5', color: '#1E3535' }}>
              <Eye size={13} /> Submissions
            </button>
            <button onClick={() => handleDelete(a._id)}
              className="p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              style={{ color: subClr }}
              onMouseEnter={e => { e.currentTarget.style.background = dark ? '#2a1414' : '#fff0f0'; e.currentTarget.style.color = '#8B3030'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = subClr; }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">

      {/* Header banner */}
      <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2a0f0f 0%, #5a2020 55%, #8B3030 100%)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F2C04E 0%, transparent 70%)', opacity: 0.18 }} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[#F2C04E] text-xs font-semibold uppercase tracking-wider">Teacher Portal</p>
            <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Assignments</h2>
            <p className="text-white/50 text-sm mt-1">Create and review student assignment submissions.</p>
          </div>
          <PrimaryBtn onClick={openAdd} className="shrink-0 self-start sm:self-auto"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: 'none' }}>
            <Plus size={15} /> Create Assignment
          </PrimaryBtn>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-5 flex-wrap">
          {[
            { label: 'Total', value: assignments.length },
            { label: 'Active', value: active.length },
            { label: 'Closed', value: closed.length },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <span className="text-lg font-bold text-white">{value}</span>
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {assignments.length === 0 && (
        <div className="rounded-2xl p-14 text-center border shadow-sm" style={{ background: cardBg, borderColor: border }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: dark ? '#1a1414' : '#fef0f0' }}>
            <ClipboardList size={28} style={{ color: dark ? '#5a2020' : '#f5a0a0' }} />
          </div>
          <p className="font-semibold text-[15px]" style={{ color: headClr }}>No assignments yet</p>
          <p className="text-sm mt-1" style={{ color: subClr }}>Create your first assignment for students.</p>
        </div>
      )}

      {/* Active */}
      {active.length > 0 && (
        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
            style={{ color: subClr }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Active ({active.length})
          </h3>
          <div className="space-y-3">
            {active.map(a => <AssignmentCard key={a._id} a={a} />)}
          </div>
        </div>
      )}

      {/* Closed */}
      {closed.length > 0 && (
        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
            style={{ color: subClr }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: subClr }} />
            Closed ({closed.length})
          </h3>
          <div className="space-y-3">
            {closed.map(a => <AssignmentCard key={a._id} a={a} />)}
          </div>
        </div>
      )}

      {/* Create modal */}
      {modal === 'add' && (
        <Modal title="Create Assignment" onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <FormField label="Course">
              <select required value={form.courseId} onChange={f('courseId')} className={selectCls}
                style={{ background: dark ? '#0f1e1e' : '#fff', borderColor: border, color: headClr }}>
                <option value="">Select a course...</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
              </select>
            </FormField>
            <FormField label="Title">
              <input required value={form.title} onChange={f('title')} className={inputCls}
                style={{ background: dark ? '#0f1e1e' : '#fff', borderColor: border, color: headClr }}
                placeholder="e.g. Lab Report 3 — SQL Joins" />
            </FormField>
            <FormField label="Description">
              <textarea rows={3} value={form.description} onChange={f('description')}
                className={`${inputCls} resize-none`}
                style={{ background: dark ? '#0f1e1e' : '#fff', borderColor: border, color: headClr }}
                placeholder="Brief instructions for students..." />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Due Date & Time">
                <input required type="datetime-local" value={form.dueDate} onChange={f('dueDate')}
                  className={inputCls}
                  style={{ background: dark ? '#0f1e1e' : '#fff', borderColor: border, color: headClr }} />
              </FormField>
              <FormField label="Total Marks">
                <input type="number" min="1" value={form.totalMarks} onChange={f('totalMarks')}
                  className={inputCls}
                  style={{ background: dark ? '#0f1e1e' : '#fff', borderColor: border, color: headClr }} />
              </FormField>
            </div>
            <ModalActions onCancel={() => setModal(null)} loading={false} saveLabel="Create Assignment" />
          </form>
        </Modal>
      )}

      {/* Submissions modal */}
      {modal === 'submissions' && (
        <Modal title={`Submissions — ${selected?.title}`} onClose={() => setModal(null)} size="xl">
          <div className="flex items-center justify-between mb-4 p-3.5 rounded-xl border"
            style={{ background: dark ? '#0f1e1e' : '#edf7f5', borderColor: dark ? '#1e3535' : '#c8e8dc' }}>
            <div className="flex items-center gap-2 text-[13px]" style={{ color: headClr }}>
              <ClipboardList size={14} style={{ color: '#1E3535' }} />
              <span>{submissions.filter(s => s.status === 'graded').length}/{submissions.length} graded</span>
            </div>
            <span className="text-[12px] font-semibold" style={{ color: '#1E3535' }}>Max: {selected?.totalMarks} marks</span>
          </div>
          <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
            {submissions.length === 0 && (
              <div className="text-center py-10" style={{ color: subClr }}>
                <ClipboardList size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No submissions yet</p>
              </div>
            )}
            {submissions.map((s, i) => (
              <div key={s._id} className="flex items-center gap-3 p-3.5 rounded-xl border transition-colors group"
                style={{ background: dark ? '#0f1e1e' : '#faf7f5', borderColor: border }}>
                <Avatar name={s.student?.name} index={i} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: headClr }}>{s.student?.name}</p>
                  <p className="text-[11px]" style={{ color: subClr }}>
                    {s.student?.studentId} · {new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  {s.content && <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: subClr }}>{s.content}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {s.status === 'graded'
                    ? <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: dark ? '#0f2518' : '#dcfce7', color: '#059669' }}>
                        {s.marks}/{selected?.totalMarks}
                      </span>
                    : <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: dark ? '#1a1a00' : '#fef9ec', color: '#b87a00' }}>
                        Pending
                      </span>
                  }
                  {s.fileUrl && (
                    <a href={s.fileUrl} target="_blank" rel="noreferrer"
                      className="text-[11px] font-medium hover:underline" style={{ color: '#1E3535' }}>File</a>
                  )}
                  <button onClick={() => openGrade(s)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-xl transition-all hover:opacity-80"
                    style={{ background: 'linear-gradient(135deg, #1E3535, #2a4a4a)', color: '#fff' }}>
                    <Award size={11} /> Grade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Grade modal */}
      {modal === 'grade' && (
        <Modal title={`Grade — ${selectedSub?.student?.name}`} onClose={() => setModal('submissions')} size="sm">
          <form onSubmit={handleGrade} className="space-y-4">
            <FormField label={`Marks (out of ${selected?.totalMarks})`}>
              <input required type="number" min="0" max={selected?.totalMarks} value={gradeForm.marks}
                onChange={e => setGradeForm(f => ({ ...f, marks: e.target.value }))}
                className={inputCls}
                style={{ background: dark ? '#0f1e1e' : '#fff', borderColor: border, color: headClr }} />
            </FormField>
            <FormField label="Feedback (optional)">
              <textarea rows={3} value={gradeForm.feedback}
                onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                className={`${inputCls} resize-none`}
                style={{ background: dark ? '#0f1e1e' : '#fff', borderColor: border, color: headClr }}
                placeholder="Write feedback for the student..." />
            </FormField>
            <div className="flex gap-3 justify-end pt-2 border-t" style={{ borderColor: border }}>
              <SecondaryBtn type="button" onClick={() => setModal('submissions')}>Back</SecondaryBtn>
              <button type="submit"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                <Award size={14} /> Save Grade
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
