import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Award, Clock, CheckCircle, ClipboardList, BookOpen, Calendar, Hash, X } from 'lucide-react';
import Modal from '../../components/Modal';
import { SecondaryBtn, Avatar } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const emptyForm = { title: '', description: '', courseId: '', dueDate: '', totalMarks: 100 };

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses]         = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [modal, setModal]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradeForm, setGradeForm]     = useState({ marks: '', feedback: '' });
  const [selectedSub, setSelectedSub] = useState(null);
  const { dark } = useTheme();

  const cardBg     = dark ? '#131e1e' : '#ffffff';
  const border     = dark ? '#1e2e2e' : '#ede8e4';
  const headClr    = dark ? '#e2e8f0' : '#1e293b';
  const subClr     = dark ? '#6e7681' : '#64748b';
  const inputStyle = { background: dark ? '#0f1e1e' : '#f8f5f3', borderColor: border, color: headClr };

  const load = () => api.get('/teacher/assignments').then(r => setAssignments(r.data));
  useEffect(() => { load(); api.get('/teacher/courses').then(r => setCourses(r.data)); }, []);

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
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await api.post('/teacher/assignments', fd);
      toast.success('Assignment created');
      load();
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
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

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const isPast = (d) => new Date(d) < new Date();
  const active = assignments.filter(a => !isPast(a.dueDate));
  const closed = assignments.filter(a =>  isPast(a.dueDate));

  const label = (txt) => (
    <label className="block text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: subClr }}>{txt}</label>
  );

  return (
    <div className="space-y-5">

      {/* ── Banner ── */}
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
          <button
            onClick={() => { setShowForm(s => !s); setForm(emptyForm); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white shrink-0 self-start sm:self-auto"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
            {showForm ? <><X size={15} /> Close Form</> : <><Plus size={15} /> New Assignment</>}
          </button>
        </div>
        <div className="flex gap-3 mt-4 flex-wrap">
          {[{ l: 'Total', v: assignments.length }, { l: 'Active', v: active.length }, { l: 'Closed', v: closed.length }].map(({ l, v }) => (
            <div key={l} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <span className="text-lg font-bold text-white">{v}</span>
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Centered Create Form ── */}
      {showForm && (
        <div className="rounded-2xl border shadow-sm overflow-hidden"
          style={{ background: cardBg, borderColor: border }}>

          {/* Form header */}
          <div className="px-8 py-5 border-b flex items-center justify-between"
            style={{ borderColor: border, background: dark ? '#0f1e1e' : '#faf7f5' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: dark ? '#1a1414' : '#fef0f0' }}>
                <ClipboardList size={22} style={{ color: '#8B3030' }} />
              </div>
              <div>
                <p className="text-[18px] font-bold" style={{ color: headClr }}>Create New Assignment</p>
                <p className="text-[13px] mt-0.5" style={{ color: subClr }}>Fill in the details below to publish to students</p>
              </div>
            </div>
            <button onClick={() => setShowForm(false)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
              style={{ background: dark ? '#1a2828' : '#f0ebe8', color: subClr }}>
              <X size={16} />
            </button>
          </div>

          {/* Form body */}
          <form onSubmit={handleSave} className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Course — full width */}
              <div className="sm:col-span-2">
                {label('Course')}
                <select required value={form.courseId} onChange={f('courseId')}
                  className="w-full px-4 py-3.5 rounded-xl text-[15px] border outline-none"
                  style={inputStyle}>
                  <option value=""></option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                </select>
              </div>

              {/* Title — full width */}
              <div className="sm:col-span-2">
                {label('Title')}
                <input required value={form.title} onChange={f('title')}
                  className="w-full px-4 py-3.5 rounded-xl text-[15px] border outline-none"
                  style={inputStyle} />
              </div>

              {/* Description — full width */}
              <div className="sm:col-span-2">
                {label('Description')}
                <textarea rows={4} value={form.description} onChange={f('description')}
                  className="w-full px-4 py-3.5 rounded-xl text-[15px] border outline-none resize-none"
                  style={inputStyle} />
              </div>

              {/* Due Date */}
              <div>
                {label('Due Date & Time')}
                <input required type="datetime-local" value={form.dueDate} onChange={f('dueDate')}
                  className="w-full px-4 py-3.5 rounded-xl text-[15px] border outline-none"
                  style={inputStyle} />
              </div>

              {/* Total Marks */}
              <div>
                {label('Total Marks')}
                <input type="number" min="1" value={form.totalMarks} onChange={f('totalMarks')}
                  className="w-full px-4 py-3.5 rounded-xl text-[15px] border outline-none"
                  style={inputStyle} />
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8 pt-6 border-t" style={{ borderColor: border }}>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-3.5 rounded-xl text-[15px] font-medium border transition-all hover:opacity-80"
                style={{ borderColor: border, color: subClr }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #8B3030, #6b2525)', boxShadow: '0 4px 14px rgba(139,48,48,0.35)' }}>
                <ClipboardList size={16} />
                {saving ? 'Creating…' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Assignment list ── */}
      {assignments.length === 0 && !showForm && (
        <div className="rounded-2xl p-14 text-center border shadow-sm" style={{ background: cardBg, borderColor: border }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: dark ? '#1a1414' : '#fef0f0' }}>
            <ClipboardList size={28} style={{ color: dark ? '#5a2020' : '#f5a0a0' }} />
          </div>
          <p className="font-semibold text-[15px]" style={{ color: headClr }}>No assignments yet</p>
          <p className="text-sm mt-1" style={{ color: subClr }}>Click "New Assignment" to get started.</p>
        </div>
      )}

      {active.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: subClr }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active ({active.length})
          </p>
          <div className="space-y-3">
            {active.map(a => <AssignmentCard key={a._id} a={a} dark={dark} cardBg={cardBg} border={border} headClr={headClr} subClr={subClr} onSubmissions={openSubmissions} onDelete={handleDelete} />)}
          </div>
        </div>
      )}

      {closed.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: subClr }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: subClr }} /> Closed ({closed.length})
          </p>
          <div className="space-y-3">
            {closed.map(a => <AssignmentCard key={a._id} a={a} dark={dark} cardBg={cardBg} border={border} headClr={headClr} subClr={subClr} onSubmissions={openSubmissions} onDelete={handleDelete} />)}
          </div>
        </div>
      )}

      {/* ── Submissions modal ── */}
      {modal === 'submissions' && (
        <Modal title={`Submissions — ${selected?.title}`} onClose={() => setModal(null)} size="xl">
          <div className="flex items-center justify-between mb-4 p-3.5 rounded-xl border"
            style={{ background: dark ? '#0f1e1e' : '#edf7f5', borderColor: dark ? '#1e3535' : '#c8e8dc' }}>
            <span className="text-[13px]" style={{ color: headClr }}>
              {submissions.filter(s => s.status === 'graded').length}/{submissions.length} graded
            </span>
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
              <div key={s._id} className="flex items-center gap-3 p-3.5 rounded-xl border"
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
                        style={{ background: dark ? '#0f2518' : '#dcfce7', color: '#059669' }}>{s.marks}/{selected?.totalMarks}</span>
                    : <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: dark ? '#1a1a00' : '#fef9ec', color: '#b87a00' }}>Pending</span>
                  }
                  {s.fileUrl && <a href={s.fileUrl} target="_blank" rel="noreferrer"
                    className="text-[11px] font-medium hover:underline" style={{ color: '#1E3535' }}>File</a>}
                  <button onClick={() => openGrade(s)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-xl hover:opacity-80"
                    style={{ background: 'linear-gradient(135deg, #1E3535, #2a4a4a)', color: '#fff' }}>
                    <Award size={11} /> Grade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ── Grade modal ── */}
      {modal === 'grade' && (
        <Modal title={`Grade — ${selectedSub?.student?.name}`} onClose={() => setModal('submissions')} size="sm">
          <form onSubmit={handleGrade} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: subClr }}>
                Marks (out of {selected?.totalMarks})
              </label>
              <input required type="number" min="0" max={selected?.totalMarks}
                value={gradeForm.marks} onChange={e => setGradeForm(p => ({ ...p, marks: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-[14px] border outline-none"
                style={{ background: dark ? '#0f1e1e' : '#f8f5f3', borderColor: border, color: headClr }} />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: subClr }}>Feedback (optional)</label>
              <textarea rows={3} value={gradeForm.feedback}
                onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl text-[14px] border outline-none resize-none"
                style={{ background: dark ? '#0f1e1e' : '#f8f5f3', borderColor: border, color: headClr }}
                placeholder="Write feedback for the student..." />
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t" style={{ borderColor: border }}>
              <SecondaryBtn type="button" onClick={() => setModal('submissions')}>Back</SecondaryBtn>
              <button type="submit"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90"
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

function AssignmentCard({ a, dark, cardBg, border, headClr, subClr, onSubmissions, onDelete }) {
  const isPast   = new Date(a.dueDate) < new Date();
  const due      = new Date(a.dueDate);
  const daysLeft = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="rounded-2xl border shadow-sm transition-all hover:shadow-md group"
      style={{ background: cardBg, borderColor: border }}>
      <div className="h-1 rounded-t-2xl"
        style={{ background: isPast ? '#6e7681' : 'linear-gradient(90deg, #8B3030, #6b2525)' }} />
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: isPast ? (dark ? '#1a1a1a' : '#f5f5f5') : (dark ? '#1a1414' : '#fef0f0') }}>
          {isPast
            ? <Clock size={16} style={{ color: subClr }} />
            : <CheckCircle size={16} style={{ color: '#8B3030' }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-[14px]" style={{ color: headClr }}>{a.title}</h3>
            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
              style={isPast
                ? { background: dark ? '#1a1a1a' : '#f0f0f0', color: subClr }
                : { background: dark ? '#1a1414' : '#fef0f0', color: '#8B3030' }}>
              {isPast ? 'Closed' : 'Active'}
            </span>
          </div>
          {a.description && <p className="text-[11px] mb-1.5 line-clamp-1" style={{ color: subClr }}>{a.description}</p>}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: dark ? '#1a2828' : '#edf7f5', color: '#1E3535' }}>
              <BookOpen size={9} /> {a.course?.name}
            </span>
            <span className="flex items-center gap-1" style={{ color: subClr }}>
              <Calendar size={9} /> {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1" style={{ color: subClr }}>
              <Hash size={9} /> {a.totalMarks} marks
            </span>
            {!isPast && daysLeft <= 7 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: daysLeft <= 2 ? (dark ? '#2a1414' : '#fef0f0') : (dark ? '#1a2828' : '#f0fdf4'),
                         color: daysLeft <= 2 ? '#8B3030' : '#059669' }}>
                {daysLeft <= 0 ? 'Due today' : `${daysLeft}d left`}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => onSubmissions(a)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-xl transition-all hover:opacity-80"
            style={{ background: dark ? '#1a2828' : '#edf7f5', color: '#1E3535' }}>
            <Eye size={12} /> Submissions
          </button>
          <button onClick={() => onDelete(a._id)}
            className="p-1.5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
            style={{ color: subClr }}
            onMouseEnter={e => { e.currentTarget.style.background = dark ? '#2a1414' : '#fff0f0'; e.currentTarget.style.color = '#8B3030'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = subClr; }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
