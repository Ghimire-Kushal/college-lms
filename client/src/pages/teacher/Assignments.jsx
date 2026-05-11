import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Edit2, Award } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { title: '', description: '', courseId: '', dueDate: '', totalMarks: 100 };

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(null); // 'add' | 'submissions' | 'grade'
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });
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

  const isPast = (d) => new Date(d) < new Date();

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Create Assignment
        </button>
      </div>

      <div className="space-y-3">
        {assignments.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">No assignments created yet</div>}
        {assignments.map(a => (
          <div key={a._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800">{a.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isPast(a.dueDate) ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                    {isPast(a.dueDate) ? 'Expired' : 'Active'}
                  </span>
                </div>
                {a.description && <p className="text-sm text-gray-500 mb-2">{a.description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{a.course?.name}</span>
                  <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                  <span>Max Marks: {a.totalMarks}</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openSubmissions(a)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
                  <Eye size={12} /> Submissions
                </button>
                <button onClick={() => handleDelete(a._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {modal === 'add' && (
        <Modal title="Create Assignment" onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
              <select required value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">-- Select --</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            {[['title', 'Title', 'text', true], ['description', 'Description', 'text', false]].map(([key, label, type, req]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type={type} required={req} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                <input type="datetime-local" required value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Total Marks</label>
                <input type="number" value={form.totalMarks} onChange={e => setForm(f => ({ ...f, totalMarks: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Submissions Modal */}
      {modal === 'submissions' && (
        <Modal title={`Submissions – ${selected?.title}`} onClose={() => setModal(null)} size="xl">
          <div className="space-y-3">
            {submissions.length === 0 && <p className="text-center py-4 text-gray-400 text-sm">No submissions yet</p>}
            {submissions.map(s => (
              <div key={s._id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">{s.student?.name[0]}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{s.student?.name}</p>
                  <p className="text-xs text-gray-400">{s.student?.studentId} · {new Date(s.submittedAt).toLocaleDateString()}</p>
                  {s.content && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{s.content}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {s.status === 'graded' ? (
                    <span className="text-sm font-semibold text-green-600">{s.marks}/{selected?.totalMarks}</span>
                  ) : (
                    <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">Pending</span>
                  )}
                  {s.fileUrl && <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">File</a>}
                  <button onClick={() => openGrade(s)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                    <Award size={12} /> Grade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Grade Modal */}
      {modal === 'grade' && (
        <Modal title={`Grade – ${selectedSub?.student?.name}`} onClose={() => setModal('submissions')} size="sm">
          <form onSubmit={handleGrade} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Marks (out of {selected?.totalMarks})</label>
              <input type="number" required max={selected?.totalMarks} value={gradeForm.marks} onChange={e => setGradeForm(f => ({ ...f, marks: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Feedback</label>
              <textarea rows={3} value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setModal('submissions')} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Back</button>
              <button type="submit" className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Save Grade</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
