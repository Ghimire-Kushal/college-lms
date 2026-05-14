import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Video, Link2, Clock, Calendar, ExternalLink, Monitor } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, FormField, ModalActions, PageHeader, inputCls, selectCls } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const emptyForm = { title: '', courseId: '', meetLink: '', scheduledAt: '', duration: 60, description: '', platform: 'meet' };

const platformInfo = {
  meet:  { label: 'Google Meet', color: '#1E8E3E', bg: '#e6f4ea' },
  zoom:  { label: 'Zoom',        color: '#2D8CFF', bg: '#e8f1ff' },
  teams: { label: 'MS Teams',    color: '#464EB8', bg: '#eceeff' },
  other: { label: 'Other',       color: '#8B3030', bg: '#fef0f0' },
};

export default function TeacherOnlineClasses() {
  const [classes, setClasses]   = useState([]);
  const [courses, setCourses]   = useState([]);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const { dark } = useTheme();

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#ede8e4';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';

  const load = () => api.get('/teacher/online-classes').then(r => setClasses(r.data));
  useEffect(() => {
    load();
    api.get('/teacher/courses').then(r => setCourses(r.data));
  }, []);

  const openAdd  = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (c) => {
    setForm({
      title: c.title, courseId: c.course._id, meetLink: c.meetLink,
      scheduledAt: new Date(c.scheduledAt).toISOString().slice(0, 16),
      duration: c.duration, description: c.description, platform: c.platform,
    });
    setSelected(c); setModal('edit');
  };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, course: form.courseId };
      if (modal === 'add') { await api.post('/teacher/online-classes', payload); toast.success('Class scheduled'); }
      else { await api.put(`/teacher/online-classes/${selected._id}`, payload); toast.success('Class updated'); }
      load(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this class?')) return;
    await api.delete(`/teacher/online-classes/${id}`);
    toast.success('Deleted'); load();
  };

  const now = new Date();
  const upcoming = classes.filter(c => new Date(c.scheduledAt) >= now);
  const past     = classes.filter(c => new Date(c.scheduledAt) < now);

  const ClassCard = ({ cls }) => {
    const pInfo = platformInfo[cls.platform] || platformInfo.other;
    const isPast = new Date(cls.scheduledAt) < now;
    const scheduled = new Date(cls.scheduledAt);
    return (
      <div className="rounded-2xl border shadow-sm transition-all hover:shadow-md group"
        style={{ background: cardBg, borderColor: border }}>
        <div className="h-1 rounded-t-2xl" style={{ background: isPast ? '#6e7681' : 'linear-gradient(90deg, #1E3535, #2a4a4a)' }} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: isPast ? (dark ? '#1a1a1a' : '#f0f0f0') : (dark ? '#0f1e1e' : '#edf7f5') }}>
                <Video size={18} style={{ color: isPast ? subClr : '#1E3535' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[14px] leading-snug" style={{ color: headClr }}>{cls.title}</h3>
                <p className="text-[12px] mt-0.5" style={{ color: subClr }}>{cls.course?.name} · {cls.course?.code}</p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(cls)}
                className="p-2 rounded-xl transition-colors" style={{ color: subClr }}
                onMouseEnter={e => { e.currentTarget.style.background = dark ? '#1a2828' : '#edf7f5'; e.currentTarget.style.color = '#1E3535'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = subClr; }}>
                <Edit2 size={13} />
              </button>
              <button onClick={() => handleDelete(cls._id)}
                className="p-2 rounded-xl transition-colors" style={{ color: subClr }}
                onMouseEnter={e => { e.currentTarget.style.background = dark ? '#2a1414' : '#fff0f0'; e.currentTarget.style.color = '#8B3030'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = subClr; }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {cls.description && (
            <p className="text-[12px] mt-3 leading-relaxed line-clamp-2" style={{ color: subClr }}>{cls.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: dark ? '#1a2020' : pInfo.bg, color: pInfo.color }}>
              <Monitor size={10} /> {pInfo.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full"
              style={{ background: dark ? '#1a1a2a' : '#f0f0ff', color: subClr }}>
              <Clock size={10} /> {cls.duration} min
            </span>
            {isPast && (
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: dark ? '#1a1a1a' : '#f0f0f0', color: subClr }}>Completed</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: border }}>
            <div className="flex items-center gap-1.5 text-[12px]" style={{ color: subClr }}>
              <Calendar size={12} />
              {scheduled.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              {' · '}
              {scheduled.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            {!isPast && (
              <a href={cls.meetLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #1E3535, #2a4a4a)', color: '#fff' }}>
                <Link2 size={11} /> Join Class <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>
    );
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
            <p className="text-[#F2C04E] text-xs font-semibold uppercase tracking-wider">Virtual Classroom</p>
            <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Online Classes</h2>
            <p className="text-white/50 text-sm mt-1">Schedule and manage your virtual classes.</p>
          </div>
          <PrimaryBtn onClick={openAdd} className="shrink-0 self-start sm:self-auto">
            <Plus size={15} /> Schedule Class
          </PrimaryBtn>
        </div>
        <div className="flex gap-3 mt-5 flex-wrap">
          {[
            { label: 'Total', value: classes.length },
            { label: 'Upcoming', value: upcoming.length },
            { label: 'Completed', value: past.length },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <span className="text-lg font-bold text-white">{value}</span>
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-[13px] font-bold uppercase tracking-wider mb-3" style={{ color: subClr }}>Upcoming</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcoming.map(cls => <ClassCard key={cls._id} cls={cls} />)}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="text-[13px] font-bold uppercase tracking-wider mb-3" style={{ color: subClr }}>Past Classes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {past.map(cls => <ClassCard key={cls._id} cls={cls} />)}
          </div>
        </div>
      )}

      {classes.length === 0 && (
        <div className="rounded-2xl p-14 text-center border shadow-sm" style={{ background: cardBg, borderColor: border }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: dark ? '#0f1e1e' : '#edf7f5' }}>
            <Video size={28} style={{ color: dark ? '#2a4a4a' : '#a8cfc8' }} />
          </div>
          <p className="font-semibold text-[15px]" style={{ color: headClr }}>No classes scheduled</p>
          <p className="text-sm mt-1" style={{ color: subClr }}>Schedule an online class to get started.</p>
        </div>
      )}

      {/* Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Schedule Online Class' : 'Edit Class'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <FormField label="Class Title">
              <input required value={form.title} onChange={f('title')} className={inputCls} placeholder="e.g. Chapter 5 — Database Design" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Course">
                <select required value={form.courseId} onChange={f('courseId')} className={selectCls}>
                  <option value="">Select course...</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </FormField>
              <FormField label="Platform">
                <select value={form.platform} onChange={f('platform')} className={selectCls}>
                  <option value="meet">Google Meet</option>
                  <option value="zoom">Zoom</option>
                  <option value="teams">MS Teams</option>
                  <option value="other">Other</option>
                </select>
              </FormField>
            </div>
            <FormField label="Meeting Link">
              <input required type="url" value={form.meetLink} onChange={f('meetLink')} className={inputCls} placeholder="https://meet.google.com/..." />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Scheduled Date & Time">
                <input required type="datetime-local" value={form.scheduledAt} onChange={f('scheduledAt')} className={inputCls} />
              </FormField>
              <FormField label="Duration (minutes)">
                <input type="number" min="15" max="240" value={form.duration} onChange={f('duration')} className={inputCls} />
              </FormField>
            </div>
            <FormField label="Description (optional)">
              <textarea rows={3} value={form.description} onChange={f('description')}
                className={`${inputCls} resize-none`} placeholder="Topics to be covered..." />
            </FormField>
            <ModalActions onCancel={() => setModal(null)} loading={false}
              saveLabel={modal === 'add' ? 'Schedule Class' : 'Update Class'} />
          </form>
        </Modal>
      )}
    </div>
  );
}
