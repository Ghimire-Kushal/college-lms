import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Users, BookOpen, Bell,
  ArrowRight, Plus, Mail, Briefcase, UserCheck,
  Edit2, Trash2, Award,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import { PrimaryBtn, FormField, ModalActions, inputCls, SectionHeader } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const emptyForm = {
  name: '', email: '', password: '', employeeId: '',
  department: '', qualification: '', phone: '',
};

function Skeleton({ className = '' }) {
  const { dark } = useTheme();
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{ background: dark ? '#1e293b' : '#f3f4f6', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}
    />
  );
}

export default function AdminDashboard() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving]     = useState(false);
  const { dark } = useTheme();
  const navigate = useNavigate();

  const border   = dark ? '#334155' : '#e5e7eb';
  const surface  = dark ? '#1e293b' : '#ffffff';
  const textHead = dark ? '#f1f5f9' : '#111827';
  const textSub  = dark ? '#94a3b8' : '#6b7280';

  const load = () =>
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const openAdd  = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = t => {
    setSelected(t);
    setForm({ name: t.name, email: t.email, password: '', employeeId: t.employeeId || '', department: t.department || '', qualification: t.qualification || '', phone: t.phone || '' });
    setModal('edit');
  };
  const openDelete = t => { setSelected(t); setModal('delete'); };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/admin/teachers', { ...form, role: 'teacher' });
        toast.success('Faculty member added');
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/teachers/${selected._id}`, payload);
        toast.success('Faculty member updated');
      }
      setModal(null); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/admin/teachers/${selected._id}`);
      toast.success('Faculty member removed');
      setModal(null); load();
    } catch {
      toast.error('Failed to delete');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Skeleton className="lg:col-span-3 h-72" />
        <Skeleton className="lg:col-span-2 h-72" />
      </div>
      <Skeleton className="h-40" />
    </div>
  );

  const teachers = data?.teachers || [];

  return (
    <div className="space-y-5">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={data?.totalStudents ?? 0} icon={GraduationCap} color="primary" />
        <StatCard title="Total Teachers" value={data?.totalTeachers ?? 0} icon={Users}         color="blue" />
        <StatCard title="Active Courses" value={data?.totalCourses ?? 0}  icon={BookOpen}      color="green" />
        <StatCard title="Notices Posted" value={data?.totalNotices ?? 0}  icon={Bell}          color="yellow" />
      </div>

      {/* Faculty + Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Faculty */}
        <div className="lg:col-span-3 rounded-xl border overflow-hidden" style={{ background: surface, borderColor: border }}>
          <SectionHeader title="Faculty" subtitle={`${teachers.length} member${teachers.length !== 1 ? 's' : ''}`}>
            <button
              onClick={() => navigate('/admin/teachers')}
              className="flex items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-70"
              style={{ color: textSub }}>
              View all <ArrowRight size={12} />
            </button>
            <PrimaryBtn onClick={openAdd} className="text-[12px] py-2 px-3">
              <Plus size={13} /> Add
            </PrimaryBtn>
          </SectionHeader>

          {teachers.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: dark ? '#0f172a' : '#f9fafb' }}>
                <Users size={20} style={{ color: dark ? '#334155' : '#d1d5db' }} />
              </div>
              <p className="text-[14px] font-medium" style={{ color: textHead }}>No faculty yet</p>
              <p className="text-[12px] mt-1" style={{ color: textSub }}>Add faculty members to get started</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: border }}>
              {teachers.slice(0, 6).map((t, i) => (
                <div
                  key={t._id}
                  className="group flex items-center gap-3 px-5 py-3 transition-colors"
                  onMouseEnter={e => { e.currentTarget.style.background = dark ? '#0f172a' : '#f9fafb'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-semibold text-white shrink-0"
                    style={{ background: ['#111827','#1d4ed8','#059669','#7c3aed','#d97706','#dc2626'][i % 6] }}
                  >
                    {t.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: textHead }}>{t.name}</p>
                    <p className="text-[11px] truncate" style={{ color: textSub }}>
                      {t.department || t.teacherId || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(t)}
                      className="p-1.5 rounded-md transition-colors"
                      style={{ color: textSub }}
                      onMouseEnter={e => { e.currentTarget.style.background = dark ? '#0f172a' : '#f3f4f6'; e.currentTarget.style.color = textHead; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textSub; }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => openDelete(t)}
                      className="p-1.5 rounded-md transition-colors"
                      style={{ color: textSub }}
                      onMouseEnter={e => { e.currentTarget.style.background = dark ? '#450a0a' : '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textSub; }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {teachers.length > 6 && (
                <div className="px-5 py-3">
                  <button onClick={() => navigate('/admin/teachers')}
                    className="text-[12px] font-medium transition-opacity hover:opacity-70"
                    style={{ color: textSub }}>
                    +{teachers.length - 6} more — View all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Students */}
        <div className="lg:col-span-2 rounded-xl border p-5" style={{ background: surface, borderColor: border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold" style={{ color: textHead }}>Recent Students</h3>
            <button onClick={() => navigate('/admin/students')}
              className="flex items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-70"
              style={{ color: textSub }}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {!data?.recentStudents?.length ? (
              <div className="py-8 text-center">
                <GraduationCap size={24} className="mx-auto mb-2" style={{ color: dark ? '#334155' : '#e5e7eb' }} />
                <p className="text-[13px]" style={{ color: textSub }}>No students yet</p>
              </div>
            ) : data.recentStudents.map((s, i) => (
              <div key={s._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                  style={{ background: ['#111827','#1d4ed8','#059669','#7c3aed','#d97706'][i % 5] }}>
                  {s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: textHead }}>{s.name}</p>
                  <p className="text-[11px]" style={{ color: textSub }}>Sem {s.semester} · {s.section || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Notices */}
      <div className="rounded-xl border p-5" style={{ background: surface, borderColor: border }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold" style={{ color: textHead }}>Recent Notices</h3>
          <button onClick={() => navigate('/admin/notices')}
            className="flex items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-70"
            style={{ color: textSub }}>
            View all <ArrowRight size={12} />
          </button>
        </div>
        {!data?.recentNotices?.length ? (
          <p className="text-[13px]" style={{ color: textSub }}>No notices yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.recentNotices.map(n => (
              <div key={n._id}
                className="flex items-start gap-3 p-3.5 rounded-lg border transition-colors"
                style={{ borderColor: border }}
                onMouseEnter={e => { e.currentTarget.style.background = dark ? '#0f172a' : '#f9fafb'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: dark ? '#0f172a' : '#f3f4f6' }}>
                  <Bell size={13} style={{ color: textSub }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: textHead }}>{n.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: textSub }}>
                    {n.postedBy?.name} · {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Faculty Member' : 'Edit Faculty Member'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Full Name">
                <input required value={form.name} onChange={f('name')} className={inputCls} placeholder="Dr. John Doe" />
              </FormField>
              <FormField label="Employee ID">
                <input value={form.employeeId} onChange={f('employeeId')} className={inputCls} placeholder="EMP001" />
              </FormField>
            </div>
            <FormField label="Email">
              <input required type="email" value={form.email} onChange={f('email')} className={inputCls} placeholder="teacher@college.edu" />
            </FormField>
            <FormField label={modal === 'add' ? 'Password' : 'New Password (leave blank to keep)'}>
              <input type="password" required={modal === 'add'} value={form.password} onChange={f('password')} className={inputCls} placeholder={modal === 'add' ? 'Min. 6 characters' : 'Leave blank to keep current'} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Department">
                <input value={form.department} onChange={f('department')} className={inputCls} placeholder="Computer Science" />
              </FormField>
              <FormField label="Qualification">
                <input value={form.qualification} onChange={f('qualification')} className={inputCls} placeholder="Ph.D, M.Sc..." />
              </FormField>
            </div>
            <FormField label="Phone">
              <input value={form.phone} onChange={f('phone')} className={inputCls} placeholder="+977-98XXXXXXXX" />
            </FormField>
            <ModalActions onCancel={() => setModal(null)} loading={saving} saveLabel={modal === 'add' ? 'Add Faculty' : 'Save Changes'} />
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <Modal title="Remove Faculty Member" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg"
              style={{ background: dark ? '#450a0a22' : '#fef2f2', border: '1px solid #fecaca' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-white shrink-0"
                style={{ background: '#111827' }}>
                {selected?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[14px]" style={{ color: textHead }}>{selected?.name}</p>
                <p className="text-[12px]" style={{ color: textSub }}>{selected?.email}</p>
              </div>
            </div>
            <p className="text-[13px]" style={{ color: textSub }}>
              This will permanently remove this faculty member and revoke their access. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-medium border transition-colors"
                style={{ borderColor: border, color: textSub }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={saving}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-colors hover:bg-[#dc2626] disabled:opacity-50"
                style={{ background: '#ef4444' }}>
                {saving ? 'Removing…' : 'Remove Faculty'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
