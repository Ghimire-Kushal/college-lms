import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Bell, Megaphone, Users, GraduationCap, UserCheck, Calendar } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, SearchBar, FormField, ModalActions, PageHeader, inputCls, selectCls } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const emptyForm = { title: '', content: '', targetRole: 'all' };

const roleInfo = {
  all:     { label: 'Everyone',      icon: Users,         color: '#6b7280', bg: '#f3f4f6',  bgDark: '#1e293b'  },
  student: { label: 'Students Only', icon: GraduationCap, color: '#2563eb', bg: '#eff6ff',  bgDark: '#1e3a5f'  },
  teacher: { label: 'Teachers Only', icon: UserCheck,     color: '#7c3aed', bg: '#faf5ff',  bgDark: '#2e1065'  },
};

export default function AdminNotices() {
  const [notices, setNotices]   = useState([]);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const { dark } = useTheme();

  const surface = dark ? '#1e293b' : '#ffffff';
  const border  = dark ? '#334155' : '#e5e7eb';
  const textHead = dark ? '#f1f5f9' : '#111827';
  const textSub  = dark ? '#94a3b8' : '#6b7280';

  const load = () => api.get('/admin/notices').then(r => setNotices(r.data));
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (n) => { setForm({ title: n.title, content: n.content, targetRole: n.targetRole }); setSelected(n); setModal('edit'); };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

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

  const filtered = notices.filter(n => {
    const matchRole = filter === 'all' || n.targetRole === filter;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Notices" subtitle="Post and manage announcements for your institution.">
        <PrimaryBtn onClick={openAdd}><Plus size={15} /> Post Notice</PrimaryBtn>
      </PageHeader>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 p-1 rounded-lg shrink-0" style={{ background: dark ? '#0f172a' : '#f3f4f6', border: `1px solid ${border}` }}>
          {['all', 'student', 'teacher'].map(key => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors capitalize"
              style={filter === key
                ? { background: surface, color: textHead, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: textSub }}
            >
              {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1) + 's'}
            </button>
          ))}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search notices..." />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-xl p-14 text-center border" style={{ background: surface, borderColor: border }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: dark ? '#0f172a' : '#f9fafb' }}>
            <Megaphone size={20} style={{ color: dark ? '#334155' : '#d1d5db' }} />
          </div>
          <p className="font-medium text-[14px]" style={{ color: textHead }}>No notices found</p>
          <p className="text-[13px] mt-1" style={{ color: textSub }}>
            {search ? 'Try a different search term.' : 'Post a notice to inform students and teachers.'}
          </p>
        </div>
      )}

      {/* Notice list */}
      <div className="space-y-2.5">
        {filtered.map(n => {
          const info = roleInfo[n.targetRole] || roleInfo.all;
          const Icon = info.icon;
          return (
            <div
              key={n._id}
              className="rounded-xl border overflow-hidden group"
              style={{ background: surface, borderColor: border }}
            >
              <div className="h-0.5" style={{ background: info.color }} />
              <div className="p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: dark ? info.bgDark : info.bg }}>
                  <Icon size={15} style={{ color: info.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-medium text-[14px]" style={{ color: textHead }}>{n.title}</h3>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                          style={{ background: dark ? info.bgDark : info.bg, color: info.color }}>
                          {info.label}
                        </span>
                      </div>
                      <p className="text-[13px] line-clamp-2" style={{ color: textSub }}>{n.content}</p>
                    </div>
                    <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(n)}
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: textSub }}
                        onMouseEnter={e => { e.currentTarget.style.background = dark ? '#0f172a' : '#f3f4f6'; e.currentTarget.style.color = textHead; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textSub; }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(n._id)}
                        className="p-1.5 rounded-md transition-colors"
                        style={{ color: textSub }}
                        onMouseEnter={e => { e.currentTarget.style.background = dark ? '#450a0a' : '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textSub; }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t" style={{ borderColor: border }}>
                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-semibold text-white shrink-0"
                      style={{ background: '#111827' }}>
                      {n.postedBy?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-[11px] font-medium truncate" style={{ color: textHead }}>{n.postedBy?.name}</span>
                    <span style={{ color: textSub }}>·</span>
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: textSub }}>
                      <Calendar size={10} />
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Post Notice' : 'Edit Notice'} onClose={() => setModal(null)}>
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
