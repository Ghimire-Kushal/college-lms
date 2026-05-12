import { useState, useEffect } from 'react';
import { Plus, Trash2, Bell, Megaphone } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, FormField, ModalActions, IconBtn, PageHeader, inputCls, selectCls, Badge } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function TeacherNotices() {
  const [notices, setNotices] = useState([]);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ title: '', content: '', targetRole: 'student' });

  const load = () => api.get('/teacher/notices').then(r => setNotices(r.data));
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await api.post('/teacher/notices', form);
    toast.success('Notice posted');
    load(); setModal(false);
    setForm({ title: '', content: '', targetRole: 'student' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove?')) return;
    await api.delete(`/teacher/notices/${id}`);
    toast.success('Removed'); load();
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-5">
      <PageHeader title="Notices" subtitle="Post announcements for your students.">
        <PrimaryBtn onClick={() => setModal(true)}><Plus size={15} /> Post Notice</PrimaryBtn>
      </PageHeader>

      {notices.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <Megaphone size={36} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">No notices posted yet</p>
          <p className="text-sm text-slate-400 mt-1">Share announcements with your students.</p>
        </div>
      )}

      <div className="space-y-3">
        {notices.map((n, i) => (
          <div key={n._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `hsl(${(i * 80 + 220) % 360}, 60%, 94%)` }}>
                <Bell size={15} style={{ color: `hsl(${(i * 80 + 220) % 360}, 60%, 45%)` }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-slate-800 text-[14px]">{n.title}</h3>
                  <Badge color={n.targetRole === 'student' ? 'green' : 'blue'}>
                    {n.targetRole === 'student' ? 'Students' : 'Everyone'}
                  </Badge>
                </div>
                <p className="text-[13px] text-slate-600 leading-relaxed">{n.content}</p>
                <p className="text-[11px] text-slate-400 mt-2">
                  {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <IconBtn icon={Trash2} onClick={() => handleDelete(n._id)} color="red" title="Remove" />
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title="Post Notice" onClose={() => setModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <FormField label="Title">
              <input required value={form.title} onChange={f('title')} className={inputCls} placeholder="Notice title..." />
            </FormField>
            <FormField label="Content">
              <textarea required rows={4} value={form.content} onChange={f('content')}
                className={`${inputCls} resize-none`} placeholder="Write the notice here..." />
            </FormField>
            <FormField label="Target Audience">
              <select value={form.targetRole} onChange={f('targetRole')} className={selectCls}>
                <option value="student">Students</option>
                <option value="all">Everyone</option>
              </select>
            </FormField>
            <ModalActions onCancel={() => setModal(false)} loading={false} saveLabel="Post Notice" />
          </form>
        </Modal>
      )}
    </div>
  );
}
