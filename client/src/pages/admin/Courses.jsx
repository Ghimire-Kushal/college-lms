import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserPlus } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { name: '', code: '', description: '', credits: 3, semester: '', section: '' };

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/admin/courses').then(r => setCourses(r.data));
  useEffect(() => { load(); api.get('/admin/teachers').then(r => setTeachers(r.data)); }, []);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (c) => { setForm(c); setSelected(c); setModal('edit'); };
  const openAssign = (c) => { setSelected(c); setTeacherId(c.teacher?._id || ''); setModal('assign'); };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modal === 'add') { await api.post('/admin/courses', form); toast.success('Course created'); }
      else { await api.put(`/admin/courses/${selected._id}`, form); toast.success('Course updated'); }
      load(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    await api.patch(`/admin/courses/${selected._id}/assign-teacher`, { teacherId });
    toast.success('Teacher assigned');
    load(); setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this course?')) return;
    await api.delete(`/admin/courses/${id}`);
    toast.success('Course deactivated'); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">No courses yet. Add one to get started.</div>}
        {courses.map(c => (
          <div key={c._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{c.name}</h3>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{c.code}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openAssign(c)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500"><UserPlus size={14} /></button>
                <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(c._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            {c.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{c.description}</p>}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Sem {c.semester} {c.section ? `· ${c.section}` : ''}</span>
              <span>{c.credits} credits</span>
              <span>{c.students?.length || 0} students</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50">
              <p className="text-xs text-gray-500">
                Teacher: <span className="font-medium text-gray-700">{c.teacher?.name || <em>Not assigned</em>}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Course' : 'Edit Course'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Course Name', required: true },
                { key: 'code', label: 'Course Code', required: true },
                { key: 'description', label: 'Description' },
                { key: 'credits', label: 'Credits', type: 'number' },
                { key: 'semester', label: 'Semester', type: 'number', required: true },
                { key: 'section', label: 'Section (e.g. A, B)' },
              ].map(({ key, label, type = 'text', required }) => (
                <div key={key} className={key === 'description' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type={type} required={required} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'assign' && (
        <Modal title={`Assign Teacher to ${selected?.name}`} onClose={() => setModal(null)} size="sm">
          <form onSubmit={handleAssign} className="space-y-4">
            <select value={teacherId} onChange={e => setTeacherId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">-- Select teacher --</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Assign</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
