import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', password: '', teacherId: '', phone: '', address: '' };

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/admin/teachers', { params: { search } }).then(r => setTeachers(r.data));
  useEffect(() => { load(); }, [search]);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (t) => { setForm({ ...t, password: '' }); setSelected(t); setModal('edit'); };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modal === 'add') { await api.post('/admin/teachers', form); toast.success('Teacher added'); }
      else { await api.put(`/admin/teachers/${selected._id}`, form); toast.success('Teacher updated'); }
      load(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this teacher?')) return;
    await api.delete(`/admin/teachers/${id}`);
    toast.success('Teacher deactivated');
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teachers..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Name', 'Teacher ID', 'Email', 'Phone', 'Actions'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {teachers.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">No teachers found</td></tr>}
            {teachers.map(t => (
              <tr key={t._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">{t.name[0]}</div>
                    <span className="font-medium text-gray-800">{t.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{t.teacherId || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{t.email}</td>
                <td className="px-4 py-3 text-gray-600">{t.phone || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(t._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Teacher' : 'Edit Teacher'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Full Name', required: true },
                { key: 'email', label: 'Email', type: 'email', required: true },
                { key: 'password', label: modal === 'add' ? 'Password' : 'New Password (optional)', type: 'password', required: modal === 'add' },
                { key: 'teacherId', label: 'Teacher ID' },
                { key: 'phone', label: 'Phone' },
                { key: 'address', label: 'Address' },
              ].map(({ key, label, type = 'text', required }) => (
                <div key={key}>
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
    </div>
  );
}
