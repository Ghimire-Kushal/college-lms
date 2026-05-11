import { useState, useEffect } from 'react';
import { Plus, Trash2, Download, FileText } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function TeacherNotes() {
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', courseId: '' });
  const [file, setFile] = useState(null);
  const [filterCourse, setFilterCourse] = useState('');
  const [loading, setLoading] = useState(false);

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
      load();
      setModal(false);
      setForm({ title: '', description: '', courseId: '' });
      setFile(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    await api.delete(`/teacher/notes/${id}`);
    toast.success('Deleted'); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <button onClick={() => setModal(true)} className="ml-auto flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Upload Note
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">No notes uploaded yet</div>}
        {notes.map(n => (
          <div key={n._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{n.title}</h3>
                <p className="text-xs text-indigo-600">{n.course?.name}</p>
              </div>
            </div>
            {n.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{n.description}</p>}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
              <div className="flex gap-1">
                {n.fileUrl && (
                  <a href={n.fileUrl} target="_blank" rel="noreferrer"
                    className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-500 transition-colors">
                    <Download size={14} />
                  </a>
                )}
                <button onClick={() => handleDelete(n._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title="Upload Note / Material" onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
              <select required value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">-- Select course --</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">File (optional, max 10MB)</label>
              <input type="file" onChange={e => setFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
