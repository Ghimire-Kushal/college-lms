import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Bell, Megaphone, Search, Users, GraduationCap, UserCheck, Calendar, ChevronRight } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, FormField, ModalActions, inputCls, selectCls } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const emptyForm = { title: '', content: '', targetRole: 'all' };

const roleInfo = {
  all:     { label: 'Everyone',      icon: Users,          bg: ['#0f1e1e','#1a3535'],  light: ['#edf7f5','#d5eeea'],  text: '#1E3535',  border: ['#1e3535','#c5e8e2'] },
  student: { label: 'Students Only', icon: GraduationCap,  bg: ['#1a1414','#2e1a1a'],  light: ['#fef9ec','#fef0d8'],  text: '#b87a00',  border: ['#3d2a00','#f5dfa0'] },
  teacher: { label: 'Teachers Only', icon: UserCheck,       bg: ['#1a1414','#2e1a1a'],  light: ['#fff0f0','#fde8e8'],  text: '#8B3030',  border: ['#5a2020','#fca5a5'] },
};

export default function AdminNotices() {
  const [notices, setNotices]   = useState([]);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const { dark } = useTheme();

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#ede8e4';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';

  const load = () => api.get('/admin/notices').then(r => setNotices(r.data));
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (n) => { setForm({ title: n.title, content: n.content, targetRole: n.targetRole }); setSelected(n); setModal('edit'); };
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

  const filtered = notices.filter(n => {
    const matchRole = filter === 'all' || n.targetRole === filter;
    const matchSearch = !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = {
    all: notices.length,
    student: notices.filter(n => n.targetRole === 'student').length,
    teacher: notices.filter(n => n.targetRole === 'teacher').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1414 0%, #0f1e1e 55%, #162828 100%)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F2C04E 0%, transparent 70%)', opacity: 0.18 }} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[#F2C04E] text-xs font-semibold uppercase tracking-wider">Announcements</p>
            <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Notices Board</h2>
            <p className="text-white/50 text-sm mt-1">Post and manage announcements for your institution.</p>
          </div>
          <PrimaryBtn onClick={openAdd} className="shrink-0 self-start sm:self-auto">
            <Plus size={15} /> Post Notice
          </PrimaryBtn>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-5 flex-wrap">
          {[
            { key: 'all', label: 'Total', value: counts.all },
            { key: 'student', label: 'Students', value: counts.student },
            { key: 'teacher', label: 'Teachers', value: counts.teacher },
          ].map(({ key, label, value }) => (
            <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <span className="text-lg font-bold text-white">{value}</span>
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter + Search toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl flex-shrink-0"
          style={{ background: dark ? '#131e1e' : '#f0ebe8', border: `1px solid ${border}` }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'student', label: 'Students' },
            { key: 'teacher', label: 'Teachers' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={filter === key
                ? { background: '#8B3030', color: '#fff', boxShadow: '0 2px 8px rgba(139,48,48,0.4)' }
                : { color: subClr }}>
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: subClr }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] border outline-none transition-all"
            style={{ background: cardBg, borderColor: border, color: headClr }}
          />
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-2xl p-14 text-center border shadow-sm" style={{ background: cardBg, borderColor: border }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: dark ? '#0f1e1e' : '#f0f7f5' }}>
            <Megaphone size={28} style={{ color: dark ? '#2a4a4a' : '#a8cfc8' }} />
          </div>
          <p className="font-semibold text-[15px]" style={{ color: headClr }}>No notices found</p>
          <p className="text-sm mt-1" style={{ color: subClr }}>
            {search ? 'Try a different search term.' : 'Post a notice to inform students and teachers.'}
          </p>
        </div>
      )}

      {/* Notice cards */}
      <div className="space-y-3">
        {filtered.map((n, i) => {
          const info = roleInfo[n.targetRole] || roleInfo.all;
          const Icon = info.icon;
          const iconBg = dark ? info.bg[0] : info.light[0];
          const cardBorder = dark ? info.border[0] : info.border[1];

          return (
            <div key={n._id}
              className="rounded-2xl border shadow-sm transition-all hover:shadow-md group"
              style={{ background: cardBg, borderColor: border }}
              onMouseEnter={e => e.currentTarget.style.borderColor = cardBorder}
              onMouseLeave={e => e.currentTarget.style.borderColor = border}>

              {/* Top color strip */}
              <div className="h-1 rounded-t-2xl" style={{
                background: `linear-gradient(90deg, ${info.text}, ${info.text}88)`
              }} />

              <div className="p-5 flex items-start gap-4">
                {/* Icon */}
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105"
                  style={{ background: iconBg }}>
                  <Icon size={18} style={{ color: info.text }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <h3 className="font-bold text-[15px] leading-snug" style={{ color: headClr }}>{n.title}</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border"
                          style={{
                            background: dark ? info.bg[1] : info.light[1],
                            color: info.text,
                            borderColor: cardBorder,
                          }}>
                          <span className="w-1 h-1 rounded-full" style={{ background: info.text }} />
                          {info.label}
                        </span>
                      </div>
                      <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: subClr }}>{n.content}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(n)}
                        className="p-2 rounded-xl transition-colors"
                        style={{ color: subClr }}
                        onMouseEnter={e => { e.currentTarget.style.background = dark ? '#1a2828' : '#edf7f5'; e.currentTarget.style.color = '#1E3535'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = subClr; }}
                        title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(n._id)}
                        className="p-2 rounded-xl transition-colors"
                        style={{ color: subClr }}
                        onMouseEnter={e => { e.currentTarget.style.background = dark ? '#2a1414' : '#fff0f0'; e.currentTarget.style.color = '#8B3030'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = subClr; }}
                        title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t" style={{ borderColor: border }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: '#8B3030' }}>
                      {n.postedBy?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-[12px] font-medium truncate" style={{ color: headClr }}>{n.postedBy?.name}</span>
                      <span style={{ color: subClr }}>·</span>
                      <span className="flex items-center gap-1 text-[11px] shrink-0" style={{ color: subClr }}>
                        <Calendar size={11} />
                        {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <ChevronRight size={14} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: info.text }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Post New Notice' : 'Edit Notice'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <FormField label="Title">
              <input required value={form.title} onChange={f('title')}
                className={inputCls} placeholder="Notice title..." />
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
            <ModalActions onCancel={() => setModal(null)} loading={false}
              saveLabel={modal === 'add' ? 'Post Notice' : 'Update Notice'} />
          </form>
        </Modal>
      )}
    </div>
  );
}
