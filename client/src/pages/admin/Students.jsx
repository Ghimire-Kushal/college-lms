import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, UserCheck } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', password: '', studentId: '', semester: '', section: '', phone: '', address: '' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'enroll'
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [enrollCourseId, setEnrollCourseId] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.get('/admin/students', { params: { search } }).then(r => setStudents(r.data));
  };

  useEffect(() => { load(); }, [search]);
  useEffect(() => { api.get('/admin/courses').then(r => setCourses(r.data)); }, []);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (s) => { setForm({ ...s, password: '' }); setSelected(s); setModal('edit'); };
  const openEnroll = (s) => { setSelected(s); setEnrollCourseId(''); setModal('enroll'); };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modal === 'add') {
        await api.post('/admin/students', form);
        toast.success('Student added');
      } else {
        await api.put(`/admin/students/${selected._id}`, form);
        toast.success('Student updated');
      }
      load();
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this student?')) return;
    await api.delete(`/admin/students/${id}`);
    toast.success('Student deactivated');
    load();
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!enrollCourseId) return;
    await api.post(`/admin/students/${selected._id}/enroll`, { courseId: enrollCourseId });
    toast.success('Student enrolled');
    load();
    setModal(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or ID..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Student ID', 'Email', 'Semester', 'Section', 'Courses', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No students found</td></tr>
              )}
              {students.map(s => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">{s.name[0]}</div>
                      <span className="font-medium text-gray-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.studentId || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email}</td>
                  <td className="px-4 py-3 text-gray-600">{s.semester || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.section || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{s.enrolledCourses?.length || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => openEnroll(s)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors"><UserCheck size={14} /></button>
                      <button onClick={() => handleDelete(s._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Student' : 'Edit Student'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Full Name', required: true },
                { key: 'email', label: 'Email', type: 'email', required: true },
                { key: 'password', label: modal === 'add' ? 'Password' : 'New Password (optional)', type: 'password', required: modal === 'add' },
                { key: 'studentId', label: 'Student ID' },
                { key: 'semester', label: 'Semester', type: 'number' },
                { key: 'section', label: 'Section' },
                { key: 'phone', label: 'Phone' },
                { key: 'address', label: 'Address' },
              ].map(({ key, label, type = 'text', required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type={type}
                    required={required}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
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

      {/* Enroll Modal */}
      {modal === 'enroll' && (
        <Modal title={`Enroll ${selected?.name} in Course`} onClose={() => setModal(null)} size="sm">
          <form onSubmit={handleEnroll} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Select Course</label>
              <select
                value={enrollCourseId}
                onChange={e => setEnrollCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose course --</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Enroll</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
