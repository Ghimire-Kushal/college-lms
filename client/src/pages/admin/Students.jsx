import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, UserCheck, GraduationCap,
  RefreshCw, CheckCircle, AlertCircle, SkipForward, XCircle, X,
} from 'lucide-react';
import Modal from '../../components/Modal';
import {
  PrimaryBtn, SecondaryBtn, SearchBar, Card, TableHead,
  EmptyRow, Avatar, Badge, FormField, ModalActions,
  IconBtn, PageHeader, inputCls, selectCls,
} from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const emptyForm = {
  name: '', email: '', password: '', studentId: '',
  semester: '', section: '', phone: '', address: '',
};

// ── Sync Result Banner ────────────────────────────────────
function SyncSummary({ result, onClose, dark }) {
  const border = dark ? '#1e2e2e' : '#e2e8f0';
  const cardBg = dark ? '#131e1e' : '#ffffff';

  const stats = [
    { label: 'Imported', value: result.summary.imported, icon: CheckCircle, color: '#059669', bg: dark ? '#0d2018' : '#ecfdf5' },
    { label: 'Updated',  value: result.summary.updated,  icon: RefreshCw,   color: '#2563eb', bg: dark ? '#0d1a30' : '#eff6ff' },
    { label: 'Skipped',  value: result.summary.skipped,  icon: SkipForward, color: '#b87a00', bg: dark ? '#2d2712' : '#fef9ec' },
    { label: 'Errors',   value: result.summary.errors,   icon: XCircle,     color: '#dc2626', bg: dark ? '#2a1010' : '#fff0f0' },
  ];

  const hasIssues =
    (result.skippedDetails?.length || 0) + (result.errorDetails?.length || 0) > 0;

  return (
    <div className="rounded-2xl border overflow-hidden shadow-sm"
      style={{ background: cardBg, borderColor: border }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: border, background: dark ? '#0f1e1e' : '#f8fafc' }}>
        <div className="flex items-center gap-2.5">
          <CheckCircle size={16} style={{ color: '#059669' }} />
          <p className="text-[14px] font-bold" style={{ color: dark ? '#e2e8f0' : '#1e293b' }}>
            Google Sheets Sync Complete
          </p>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: dark ? '#1a2828' : '#e8f4f1', color: dark ? '#5dbfb0' : '#1E3535' }}>
            {result.summary.total} rows processed
          </span>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
          style={{ background: dark ? '#1e2e2e' : '#f1f5f9', color: dark ? '#94a3b8' : '#64748b' }}>
          <X size={13} />
        </button>
      </div>

      {/* Stat chips */}
      <div className="px-5 py-4 flex flex-wrap gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
            style={{ background: bg, border: `1px solid ${color}22` }}>
            <Icon size={15} style={{ color }} />
            <div>
              <p className="text-[18px] font-bold leading-none" style={{ color }}>{value}</p>
              <p className="text-[10px] font-semibold mt-0.5 uppercase tracking-wide" style={{ color }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail tables (only shown when there are skipped/errored rows) */}
      {hasIssues && (
        <div className="px-5 pb-4 space-y-3">
          {result.skippedDetails?.length > 0 && (
            <details open className="rounded-xl border overflow-hidden"
              style={{ borderColor: dark ? '#2d2712' : '#fef0c0' }}>
              <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer select-none text-[12px] font-semibold"
                style={{ background: dark ? '#2d2712' : '#fef9ec', color: '#b87a00' }}>
                <SkipForward size={13} />
                {result.skippedDetails.length} skipped row{result.skippedDetails.length !== 1 ? 's' : ''}
              </summary>
              <div className="divide-y" style={{ borderColor: dark ? '#1e2e2e' : '#f1f5f9' }}>
                {result.skippedDetails.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2">
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: dark ? '#2d2712' : '#fef9ec', color: '#b87a00' }}>
                      Row {d.row}
                    </span>
                    <span className="text-[12px]" style={{ color: dark ? '#94a3b8' : '#64748b' }}>{d.reason}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {result.errorDetails?.length > 0 && (
            <details open className="rounded-xl border overflow-hidden"
              style={{ borderColor: dark ? '#2a1010' : '#fca5a5' }}>
              <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer select-none text-[12px] font-semibold"
                style={{ background: dark ? '#2a1010' : '#fff0f0', color: '#dc2626' }}>
                <AlertCircle size={13} />
                {result.errorDetails.length} error{result.errorDetails.length !== 1 ? 's' : ''}
              </summary>
              <div className="divide-y" style={{ borderColor: dark ? '#1e2e2e' : '#f1f5f9' }}>
                {result.errorDetails.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2">
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: dark ? '#2a1010' : '#fff0f0', color: '#dc2626' }}>
                      Row {d.row}
                    </span>
                    <span className="text-[12px]" style={{ color: dark ? '#94a3b8' : '#64748b' }}>{d.reason}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function Students() {
  const [students, setStudents]   = useState([]);
  const [courses, setCourses]     = useState([]);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [selected, setSelected]   = useState(null);
  const [enrollId, setEnrollId]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [syncing, setSyncing]     = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const { dark } = useTheme();

  const load = () =>
    api.get('/admin/students', { params: { search } }).then(r => setStudents(r.data));

  useEffect(() => { load(); }, [search]);
  useEffect(() => { api.get('/admin/courses').then(r => setCourses(r.data)); }, []);

  const openAdd    = () => { setForm(emptyForm); setModal('add'); };
  const openEdit   = (s) => { setForm({ ...s, password: '' }); setSelected(s); setModal('edit'); };
  const openEnroll = (s) => { setSelected(s); setEnrollId(''); setModal('enroll'); };

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

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
      load(); setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this student?')) return;
    await api.delete(`/admin/students/${id}`);
    toast.success('Student deactivated'); load();
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!enrollId) return;
    await api.post(`/admin/students/${selected._id}/enroll`, { courseId: enrollId });
    toast.success('Enrolled successfully'); load(); setModal(null);
  };

  // ── Google Sheets Sync ──────────────────────────────────
  const handleGoogleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const { data } = await api.post('/admin/import/students/google-sheets');
      setSyncResult(data);
      toast.success(
        `Sync done: ${data.summary.imported} imported, ${data.summary.updated} updated`,
        { duration: 5000 }
      );
      load(); // refresh student list
    } catch (err) {
      const msg = err.response?.data?.message || 'Sync failed';
      toast.error(msg, { duration: 6000 });
      // Show error in result banner too if we have details
      if (err.response?.data) setSyncResult(err.response.data);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Students" subtitle="Manage student accounts and course enrollments.">
        {/* Google Sheets Sync button */}
        <button
          onClick={handleGoogleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-md"
          style={{
            background: syncing
              ? (dark ? '#1a2828' : '#f0fdf4')
              : 'linear-gradient(135deg, #16a34a, #15803d)',
            color: syncing ? (dark ? '#5dbfb0' : '#16a34a') : '#ffffff',
            borderColor: syncing ? (dark ? '#2a3f3f' : '#bbf7d0') : 'transparent',
            boxShadow: syncing ? 'none' : '0 4px 12px rgba(22,163,74,0.3)',
          }}>
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing…' : 'Sync from Google Sheets'}
        </button>

        <PrimaryBtn onClick={openAdd}>
          <Plus size={15} /> Add Student
        </PrimaryBtn>
      </PageHeader>

      {/* Sync result banner */}
      {syncResult && syncResult.summary && (
        <SyncSummary
          result={syncResult}
          onClose={() => setSyncResult(null)}
          dark={dark}
        />
      )}

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email or ID..." />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead cols={['Student', 'ID', 'Semester', 'Section', 'Courses', 'Actions']} />
            <tbody>
              {students.length === 0 && <EmptyRow cols={7} message="No students found" />}
              {students.map((s, i) => (
                <tr key={s._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} index={i} />
                      <div>
                        <p className="font-semibold text-slate-700 text-[13px]">{s.name}</p>
                        <p className="text-[11px] text-slate-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><Badge color="slate">{s.studentId || '—'}</Badge></td>
                  <td className="px-4 py-3.5"><Badge color="indigo">Sem {s.semester || '—'}</Badge></td>
                  <td className="px-4 py-3.5 text-[13px] text-slate-500">{s.section || '—'}</td>
                  <td className="px-4 py-3.5"><Badge color="purple">{s.enrolledCourses?.length || 0} courses</Badge></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <IconBtn icon={Edit2}     onClick={() => openEdit(s)}          color="slate" title="Edit" />
                      <IconBtn icon={UserCheck} onClick={() => openEnroll(s)}        color="green" title="Enroll" />
                      <IconBtn icon={Trash2}    onClick={() => handleDelete(s._id)}  color="red"   title="Deactivate" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Student' : 'Edit Student'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Full Name">
                <input required type="text"  value={form.name}      onChange={f('name')}      className={inputCls} placeholder="John Doe" />
              </FormField>
              <FormField label="Email">
                <input required type="email" value={form.email}     onChange={f('email')}     className={inputCls} placeholder="john@example.com" />
              </FormField>
              <FormField label={modal === 'add' ? 'Password' : 'New Password (optional)'}>
                <input type="password" required={modal === 'add'} value={form.password} onChange={f('password')} className={inputCls} placeholder="••••••••" />
              </FormField>
              <FormField label="Student ID">
                <input type="text"   value={form.studentId} onChange={f('studentId')} className={inputCls} placeholder="STU001" />
              </FormField>
              <FormField label="Semester">
                <input type="number" value={form.semester}  onChange={f('semester')}  className={inputCls} placeholder="1" />
              </FormField>
              <FormField label="Section">
                <input type="text"   value={form.section}   onChange={f('section')}   className={inputCls} placeholder="A" />
              </FormField>
              <FormField label="Phone">
                <input type="text"   value={form.phone}     onChange={f('phone')}     className={inputCls} placeholder="+1 555 0100" />
              </FormField>
              <FormField label="Address">
                <input type="text"   value={form.address}   onChange={f('address')}   className={inputCls} placeholder="123 Main St" />
              </FormField>
            </div>
            <ModalActions
              onCancel={() => setModal(null)}
              loading={loading}
              saveLabel={modal === 'add' ? 'Add Student' : 'Save Changes'}
            />
          </form>
        </Modal>
      )}

      {/* Enroll Modal */}
      {modal === 'enroll' && (
        <Modal title={`Enroll ${selected?.name}`} onClose={() => setModal(null)} size="sm">
          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <GraduationCap size={18} className="text-indigo-500 shrink-0" />
              <p className="text-[13px] font-medium text-slate-700">{selected?.name}</p>
            </div>
            <FormField label="Select Course">
              <select value={enrollId} onChange={e => setEnrollId(e.target.value)} className={selectCls}>
                <option value="">Choose a course...</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </FormField>
            <div className="flex gap-3 justify-end pt-2">
              <SecondaryBtn type="button" onClick={() => setModal(null)}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                Enroll
              </PrimaryBtn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
