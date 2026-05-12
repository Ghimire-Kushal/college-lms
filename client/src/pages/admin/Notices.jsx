import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Bell, Megaphone } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, FormField, ModalActions, IconBtn, inputCls, selectCls, Badge } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { title: '', content: '', targetRole: 'all' };

const roleInfo = {
  all:     { label: 'Everyone',       color: 'blue',   dot: 'bg-sky-400' },
  student: { label: 'Students Only',  color: 'green',  dot: 'bg-emerald-400' },
  teacher: { label: 'Teachers Only',  color: 'purple', dot: 'bg-purple-400' },
};

export default function AdminNotices() {
  const [notices, setNotices]   = useState([]);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [selected, setSelected] = useState(null);

  const load = () => api.get('/admin/notices').then(r => setNotices(r.data));
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (n) => { setForm(n); setSelected(n); setModal('edit'); };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

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

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <PrimaryBtn onClick={openAdd}><Plus size={15} /> Post Notice</PrimaryBtn>
      </div>

      {notices.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <Megaphone size={36} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">No notices yet</p>
          <p className="text-sm text-slate-400 mt-1">Post a notice to inform students and teachers.</p>
        </div>
      )}

      <div className="space-y-3">
        {notices.map((n) => {
          const info = roleInfo[n.targetRole] || roleInfo.all;
          return (
            <div key={n._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-indigo-50`}>
                    <Bell size={16} className="text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-800 text-[15px]">{n.title}</h3>
                      <Badge color={info.color}>{info.label}</Badge>
                    </div>
                    <p className="text-[13px] text-slate-600 leading-relaxed">{n.content}</p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Posted by <span className="font-medium text-slate-500">{n.postedBy?.name}</span>
                      {' · '}
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <IconBtn icon={Edit2}  onClick={() => openEdit(n)}   color="slate" title="Edit" />
                  <IconBtn icon={Trash2} onClick={() => handleDelete(n._id)} color="red" title="Delete" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Post New Notice' : 'Edit Notice'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <FormField label="Title">
              <input required value={form.title} onChange={f('title')} className={inputCls} placeholder="Notice title..." />
            </FormField>
            <FormField label="Content">
              <textarea required rows={4} value={form.content} onChange={f('content')}
                className={`${inputCls} resize-none`} placeholder="Write the notice content here..." />
            </FormField>
            <FormField label="Target Audience">
              <select value={form.targetRole} onChange={f('targetRole')} className={selectCls}>
                <option value="all">Everyone</option>
                <option value="student">Students Only</option>
                <option value="teacher">Teachers Only</option>
              </select>
            </FormField>
            <ModalActions onCancel={() => setModal(null)} loading={false} saveLabel={modal === 'add' ? 'Post Notice' : 'Update Notice'} />
          </form>
        </Modal>
      )}
    </div>
  );
}
