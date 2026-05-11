import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { title: '', content: '', targetRole: 'all' };

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);

  const load = () => api.get('/admin/notices').then(r => setNotices(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (n) => { setForm(n); setSelected(n); setModal('edit'); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'add') { await api.post('/admin/notices', form); toast.success('Notice posted'); }
      else { await api.put(`/admin/notices/${selected._id}`, form); toast.success('Notice updated'); }
      load(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this notice?')) return;
    await api.delete(`/admin/notices/${id}`);
    toast.success('Notice removed'); load();
  };

  const roleColors = { all: 'bg-blue-50 text-blue-700', student: 'bg-green-50 text-green-700', teacher: 'bg-purple-50 text-purple-700' };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Post Notice
        </button>
      </div>

      <div className="space-y-3">
        {notices.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">No notices yet</div>}
        {notices.map(n => (
          <div key={n._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800">{n.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleColors[n.targetRole]}`}>{n.targetRole}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{n.content}</p>
                <p className="text-xs text-gray-400 mt-2">Posted by {n.postedBy?.name} · {new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(n)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(n._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Post Notice' : 'Edit Notice'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
              <textarea required rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Target Audience</label>
              <select value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">Everyone</option>
                <option value="student">Students Only</option>
                <option value="teacher">Teachers Only</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Post</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
