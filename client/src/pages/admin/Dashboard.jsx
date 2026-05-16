import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Users, BookOpen, Bell,
  ArrowRight, Plus, Mail, Briefcase, UserCheck,
  Edit2, Trash2, Award,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import { PrimaryBtn, FormField, ModalActions, inputCls } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const TEACHER_COLORS = ['#8B3030', '#1E3535', '#b87a00', '#2a6648', '#7A2E2E', '#2a4a8a'];

const emptyForm = {
  name: '', email: '', password: '', employeeId: '',
  department: '', qualification: '', phone: '',
};

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // 'add' | 'edit' | 'delete'
  const [form, setForm]       = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving]   = useState(false);
  const { dark } = useTheme();
  const navigate = useNavigate();

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#ede8e4';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#94a3b8' : '#64748b';

  const load = () =>
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = t => {
    setSelected(t);
    setForm({
      name: t.name, email: t.email, password: '',
      employeeId: t.employeeId || '', department: t.department || '',
      qualification: t.qualification || '', phone: t.phone || '',
    });
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
      <Skeleton className="h-32" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Skeleton className="lg:col-span-3 h-72" />
        <Skeleton className="lg:col-span-2 h-72" />
      </div>
      <Skeleton className="h-36" />
    </div>
  );

  const teachers = data?.teachers || [];

  return (
    <div className="space-y-5">

      {/* Welcome banner */}
      <div className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0a1414 0%, #162828 55%, #1e3535 100%)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F2C04E 0%, transparent 70%)', opacity: 0.15 }} />
        <div>
          <p className="text-[#F2C04E] text-xs font-semibold uppercase tracking-wider">Admin Portal</p>
          <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Welcome back! 👋</h2>
          <p className="text-white/50 text-sm mt-1">Here's an overview of your institution today.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <p className="text-2xl font-bold text-white">{data?.totalStudents ?? 0}</p>
            <p className="text-[#F2C04E] text-[11px] font-medium mt-0.5">Students</p>
          </div>
          <div className="text-center px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <p className="text-2xl font-bold text-white">{data?.totalCourses ?? 0}</p>
            <p className="text-[#F2C04E] text-[11px] font-medium mt-0.5">Courses</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Students" value={data?.totalStudents ?? 0} icon={GraduationCap} color="maroon" gradient />
        <StatCard title="Total Teachers" value={data?.totalTeachers ?? 0} icon={Users}         color="teal"   gradient />
        <StatCard title="Active Courses" value={data?.totalCourses ?? 0}  icon={BookOpen}      color="green"  gradient />
        <StatCard title="Notices Posted" value={data?.totalNotices ?? 0}  icon={Bell}          color="gold"   gradient />
      </div>

      {/* Faculty + Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Faculty Management */}
        <div className="lg:col-span-3 rounded-2xl border shadow-sm overflow-hidden"
          style={{ background: cardBg, borderColor: border }}>
          {/* Header */}
          <div className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: border, background: dark ? '#0f1e1e' : '#fafafa' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: dark ? '#1a2828' : '#e8f4f1' }}>
                <Briefcase size={15} style={{ color: '#1E3535' }} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold" style={{ color: headClr }}>Faculty</h2>
                <p className="text-[11px]" style={{ color: subClr }}>{teachers.length} member{teachers.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/admin/teachers')}
                className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                style={{ color: subClr, background: dark ? '#1a2828' : '#f1f5f9' }}>
                View all <ArrowRight size={12} />
              </button>
              <PrimaryBtn onClick={openAdd} className="text-[12px] py-1.5 px-3">
                <Plus size={13} /> Add Faculty
              </PrimaryBtn>
            </div>
          </div>

          {/* List */}
          {teachers.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: dark ? '#1a2828' : '#e8f4f1' }}>
                <Users size={24} style={{ color: dark ? '#5dbfb0' : '#a0c4bb' }} />
              </div>
              <p className="text-[14px] font-semibold" style={{ color: headClr }}>No faculty members yet</p>
              <p className="text-[12px] mt-1" style={{ color: subClr }}>Click "Add Faculty" to get started.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: border }}>
              {teachers.map((t, i) => (
                <div key={t._id}
                  className="group flex items-center gap-4 px-5 py-3.5 transition-colors"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.02)' : '#fafaf9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: TEACHER_COLORS[i % TEACHER_COLORS.length] }}>
                    {t.name?.[0]?.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-bold truncate" style={{ color: headClr }}>{t.name}</p>
                      {t.employeeId && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: dark ? '#1a2828' : '#e8f4f1', color: dark ? '#5dbfb0' : '#1E3535' }}>
                          {t.employeeId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: subClr }}>
                        <Mail size={10} /> {t.email}
                      </span>
                      {t.department && (
                        <>
                          <span style={{ color: subClr }}>·</span>
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: subClr }}>
                            <Award size={10} /> {t.department}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full"
                      style={{ background: dark ? '#0d2018' : '#ecfdf5', color: '#059669' }}>
                      <UserCheck size={10} /> Active
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(t)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: subClr }}
                      onMouseEnter={e => { e.currentTarget.style.background = dark ? '#1a2828' : '#edf7f5'; e.currentTarget.style.color = '#1E3535'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = subClr; }}
                      title="Edit">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => openDelete(t)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: subClr }}
                      onMouseEnter={e => { e.currentTarget.style.background = dark ? '#2a1414' : '#fff0f0'; e.currentTarget.style.color = '#8B3030'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = subClr; }}
                      title="Remove">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Students */}
        <div className="lg:col-span-2 rounded-2xl p-5 sm:p-6 border shadow-sm"
          style={{ background: cardBg, borderColor: border }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold" style={{ color: headClr }}>Recent Students</h2>
            <button
              onClick={() => navigate('/admin/students')}
              className="flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: '#8B3030' }}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {!data?.recentStudents?.length && (
              <div className="flex flex-col items-center py-8" style={{ color: subClr }}>
                <GraduationCap size={28} className="mb-2 opacity-30" />
                <p className="text-sm opacity-50">No students yet</p>
              </div>
            )}
            {data?.recentStudents?.map((s, i) => {
              const colors = ['#8B3030', '#1E3535', '#b87a00', '#2a6648', '#7A2E2E'];
              return (
                <div key={s._id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: colors[i % colors.length] }}>
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: headClr }}>{s.name}</p>
                    <p className="text-[11px]" style={{ color: subClr }}>{s.studentId} · Sem {s.semester}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border shrink-0"
                    style={{ background: dark ? '#1a2828' : '#f5f0ed', color: subClr, borderColor: border }}>
                    §{s.section || '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Notices */}
      <div className="rounded-2xl p-5 sm:p-6 border shadow-sm"
        style={{ background: cardBg, borderColor: border }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold" style={{ color: headClr }}>Recent Notices</h2>
          <button
            onClick={() => navigate('/admin/notices')}
            className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#8B3030' }}>
            View all <ArrowRight size={13} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {!data?.recentNotices?.length && (
            <p className="text-sm col-span-3" style={{ color: subClr }}>No notices yet</p>
          )}
          {data?.recentNotices?.map((n, i) => {
            const noticeColors = [
              { bg: dark ? '#1a1a0d' : '#fef9ec', border: dark ? '#2a2808' : '#f5e8c0', icon: '#b87a00' },
              { bg: dark ? '#1a1414' : '#fef0f0', border: dark ? '#2e1a1a' : '#f5d0d0', icon: '#8B3030' },
              { bg: dark ? '#0d1a1a' : '#edf7f5', border: dark ? '#122828' : '#c5e8e2', icon: '#1E3535' },
            ];
            const nc = noticeColors[i % noticeColors.length];
            return (
              <div key={n._id} className="flex items-start gap-3 p-3.5 rounded-xl border transition-all hover:shadow-sm"
                style={{ background: nc.bg, borderColor: nc.border }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: nc.border }}>
                  <Bell size={14} style={{ color: nc.icon }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: headClr }}>{n.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: subClr }}>
                    {n.postedBy?.name} · {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
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
              <input
                type="password"
                required={modal === 'add'}
                value={form.password}
                onChange={f('password')}
                className={inputCls}
                placeholder={modal === 'add' ? 'Minimum 6 characters' : 'Leave blank to keep current'}
              />
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
            <ModalActions
              onCancel={() => setModal(null)}
              loading={saving}
              saveLabel={modal === 'add' ? 'Add Faculty' : 'Save Changes'}
            />
          </form>
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {modal === 'delete' && (
        <Modal title="Remove Faculty Member" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: dark ? '#2a1414' : '#fff0f0', border: '1px solid #fca5a5' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white shrink-0"
                style={{ background: '#8B3030' }}>
                {selected?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-[14px]" style={{ color: headClr }}>{selected?.name}</p>
                <p className="text-[12px]" style={{ color: subClr }}>{selected?.email}</p>
              </div>
            </div>
            <p className="text-[13px]" style={{ color: subClr }}>
              This will permanently remove this faculty member and revoke their access. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-medium border"
                style={{ borderColor: border, color: subClr }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #8B3030, #6b2525)' }}>
                {saving ? 'Removing…' : 'Remove Faculty'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
