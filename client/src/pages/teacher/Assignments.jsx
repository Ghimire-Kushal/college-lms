import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Award, Clock, CheckCircle, ClipboardList } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, SecondaryBtn, Card, FormField, ModalActions, IconBtn, PageHeader, inputCls, selectCls, Badge, Avatar } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

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

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const isPast = (d) => new Date(d) < new Date();

  return (
    <div className="space-y-5">
      <PageHeader title="Assignments" subtitle="Create and review student assignment submissions.">
        <PrimaryBtn onClick={openAdd}><Plus size={15} /> Create Assignment</PrimaryBtn>
      </PageHeader>

      {assignments.length === 0 && (
        <Card>
          <div className="flex flex-col items-center py-16 text-slate-300">
            <ClipboardList size={40} className="mb-3" />
            <p className="text-slate-500 font-medium">No assignments yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first assignment for students.</p>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {assignments.map(a => {
          const past = isPast(a.dueDate);
          return (
            <div key={a._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors overflow-hidden">
              <div className={`h-1 ${past ? 'bg-rose-400' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'}`} />
              <div className="p-5 flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${past ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
                  {past ? <Clock size={18} /> : <CheckCircle size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-[14px]">{a.title}</h3>
                    <Badge color={past ? 'red' : 'green'}>{past ? 'Closed' : 'Active'}</Badge>
                    <Badge color="indigo">{a.course?.name}</Badge>
                  </div>
                  {a.description && <p className="text-[12px] text-slate-500 mb-2 line-clamp-1">{a.description}</p>}
                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span>Due: {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Max Marks: <span className="font-semibold text-slate-600">{a.totalMarks}</span></span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openSubmissions(a)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                    <Eye size={13} /> Submissions
                  </button>
                  <IconBtn icon={Trash2} onClick={() => handleDelete(a._id)} color="red" title="Delete" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal === 'add' && (
        <Modal title="Create Assignment" onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <FormField label="Course">
              <select required value={form.courseId} onChange={f('courseId')} className={selectCls}>
                <option value="">Select a course...</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Title">
              <input required type="text" value={form.title} onChange={f('title')} className={inputCls} placeholder="Assignment title..." />
            </FormField>
            <FormField label="Description">
              <input type="text" value={form.description} onChange={f('description')} className={inputCls} placeholder="Brief instructions..." />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Due Date">
                <input required type="datetime-local" value={form.dueDate} onChange={f('dueDate')} className={inputCls} />
              </FormField>
              <FormField label="Total Marks">
                <input type="number" value={form.totalMarks} onChange={f('totalMarks')} className={inputCls} />
              </FormField>
            </div>
            <ModalActions onCancel={() => setModal(null)} loading={false} saveLabel="Create Assignment" />
          </form>
        </Modal>
      )}

      {modal === 'submissions' && (
        <Modal title={`Submissions — ${selected?.title}`} onClose={() => setModal(null)} size="xl">
          <div className="space-y-2.5">
            {submissions.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <ClipboardList size={28} className="mx-auto mb-2" />
                <p className="text-sm">No submissions yet</p>
              </div>
            )}
            {submissions.map((s, i) => (
              <div key={s._id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/40 transition-colors">
                <Avatar name={s.student?.name} index={i} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-700">{s.student?.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {s.student?.studentId} · Submitted {new Date(s.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  {s.content && <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{s.content}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {s.status === 'graded'
                    ? <Badge color="green">{s.marks}/{selected?.totalMarks}</Badge>
                    : <Badge color="yellow">Pending</Badge>
                  }
                  {s.fileUrl && (
                    <a href={s.fileUrl} target="_blank" rel="noreferrer"
                      className="text-[11px] text-sky-600 hover:underline font-medium">File</a>
                  )}
                  <button onClick={() => openGrade(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors">
                    <Award size={12} /> Grade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {modal === 'grade' && (
        <Modal title={`Grade — ${selectedSub?.student?.name}`} onClose={() => setModal('submissions')} size="sm">
          <form onSubmit={handleGrade} className="space-y-4">
            <FormField label={`Marks (out of ${selected?.totalMarks})`}>
              <input required type="number" max={selected?.totalMarks} value={gradeForm.marks}
                onChange={e => setGradeForm(f => ({ ...f, marks: e.target.value }))} className={inputCls} />
            </FormField>
            <FormField label="Feedback">
              <textarea rows={3} value={gradeForm.feedback}
                onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                className={`${inputCls} resize-none`} placeholder="Optional feedback..." />
            </FormField>
            <div className="flex gap-3 justify-end pt-2">
              <SecondaryBtn type="button" onClick={() => setModal('submissions')}>Back</SecondaryBtn>
              <PrimaryBtn type="submit" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>Save Grade</PrimaryBtn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
