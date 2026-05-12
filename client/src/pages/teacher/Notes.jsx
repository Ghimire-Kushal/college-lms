import { useState, useEffect } from 'react';
import { Plus, Trash2, Download, FileText, BookOpen } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, SecondaryBtn, FormField, ModalActions, IconBtn, inputCls, selectCls, Badge } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function TeacherNotes() {
  const [notes, setNotes]           = useState([]);
  const [courses, setCourses]       = useState([]);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState({ title: '', description: '', courseId: '' });
  const [file, setFile]             = useState(null);
  const [filterCourse, setFilter]   = useState('');
  const [loading, setLoading]       = useState(false);

  const load = () => api.get('/teacher/notes', { params: { courseId: filterCourse } }).then(r => setNotes(r.data));
  useEffect(() => { api.get('/teacher/courses').then(r => setCourses(r.data)); }, []);
  useEffect(() => { load(); }, [filterCourse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      await api.post('/teacher/notes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Note uploaded');
      load(); setModal(false);
      setForm({ title: '', description: '', courseId: '' }); setFile(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    await api.delete(`/teacher/notes/${id}`);
    toast.success('Deleted'); load();
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const fileExt = (url) => url?.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <select value={filterCourse} onChange={e => setFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <PrimaryBtn onClick={() => setModal(true)} className="ml-auto"><Plus size={15} /> Upload Note</PrimaryBtn>
      </div>

      {notes.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <FileText size={36} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">No notes uploaded yet</p>
          <p className="text-sm text-slate-400 mt-1">Share study materials with your students.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((n, i) => {
          const hue = (i * 67 + 200) % 360;
          return (
            <div key={n._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden card-hover">
              <div className="h-1.5" style={{ background: `hsl(${hue}, 65%, 55%)` }} />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold"
                    style={{ background: `hsl(${hue}, 65%, 55%)` }}>
                    {n.fileUrl ? fileExt(n.fileUrl) : <BookOpen size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-[14px] truncate">{n.title}</h3>
                    <Badge color="indigo">{n.course?.name}</Badge>
                  </div>
                </div>
                {n.description && <p className="text-[12px] text-slate-500 mb-3 line-clamp-2">{n.description}</p>}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="flex gap-1">
                    {n.fileUrl && (
                      <a href={n.fileUrl} target="_blank" rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition-colors">
                        <Download size={14} />
                      </a>
                    )}
                    <IconBtn icon={Trash2} onClick={() => handleDelete(n._id)} color="red" title="Delete" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title="Upload Note / Material" onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Course">
              <select required value={form.courseId} onChange={f('courseId')} className={selectCls}>
                <option value="">Select a course...</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Title">
              <input required value={form.title} onChange={f('title')} className={inputCls} placeholder="Note title..." />
            </FormField>
            <FormField label="Description">
              <textarea rows={3} value={form.description} onChange={f('description')}
                className={`${inputCls} resize-none`} placeholder="Brief description (optional)..." />
            </FormField>
            <FormField label="File (optional, max 10MB)">
              <input type="file" onChange={e => setFile(e.target.files[0])}
                className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </FormField>
            <ModalActions onCancel={() => setModal(false)} loading={loading} saveLabel={loading ? 'Uploading...' : 'Upload Note'} />
          </form>
        </Modal>
      )}
    </div>
  );
}
