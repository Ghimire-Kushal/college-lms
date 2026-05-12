import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCheck, GraduationCap } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, SecondaryBtn, SearchBar, Card, TableHead, EmptyRow, Avatar, Badge, FormField, ModalActions, IconBtn, inputCls, labelCls, selectCls } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', password: '', studentId: '', semester: '', section: '', phone: '', address: '' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses]   = useState([]);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [enrollId, setEnrollId] = useState('');
  const [loading, setLoading]   = useState(false);

  const load = () => api.get('/admin/students', { params: { search } }).then(r => setStudents(r.data));
  useEffect(() => { load(); }, [search]);
  useEffect(() => { api.get('/admin/courses').then(r => setCourses(r.data)); }, []);

  const openAdd    = () => { setForm(emptyForm); setModal('add'); };
  const openEdit   = (s) => { setForm({ ...s, password: '' }); setSelected(s); setModal('edit'); };
  const openEnroll = (s) => { setSelected(s); setEnrollId(''); setModal('enroll'); };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modal === 'add') { await api.post('/admin/students', form); toast.success('Student added'); }
      else { await api.put(`/admin/students/${selected._id}`, form); toast.success('Student updated'); }
      load(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email or ID..." />
        <PrimaryBtn onClick={openAdd}><Plus size={15} /> Add Student</PrimaryBtn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead cols={['Student', 'ID', 'Email', 'Semester', 'Section', 'Courses', 'Actions']} />
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
                  <td className="px-4 py-3.5 text-[13px] text-slate-500">{s.email}</td>
                  <td className="px-4 py-3.5"><Badge color="indigo">Sem {s.semester || '—'}</Badge></td>
                  <td className="px-4 py-3.5 text-[13px] text-slate-500">{s.section || '—'}</td>
                  <td className="px-4 py-3.5"><Badge color="purple">{s.enrolledCourses?.length || 0} courses</Badge></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <IconBtn icon={Edit2}     onClick={() => openEdit(s)}   color="slate" title="Edit" />
                      <IconBtn icon={UserCheck} onClick={() => openEnroll(s)} color="green" title="Enroll" />
                      <IconBtn icon={Trash2}    onClick={() => handleDelete(s._id)} color="red" title="Deactivate" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Student' : 'Edit Student'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Full Name"><input required type="text"     value={form.name}      onChange={f('name')}      className={inputCls} placeholder="John Doe" /></FormField>
              <FormField label="Email">   <input required type="email"    value={form.email}     onChange={f('email')}     className={inputCls} placeholder="john@example.com" /></FormField>
              <FormField label={modal === 'add' ? 'Password' : 'New Password (optional)'}>
                <input type="password" required={modal === 'add'} value={form.password} onChange={f('password')} className={inputCls} placeholder="••••••••" />
              </FormField>
              <FormField label="Student ID"><input type="text" value={form.studentId} onChange={f('studentId')} className={inputCls} placeholder="STU001" /></FormField>
              <FormField label="Semester">  <input type="number" value={form.semester}  onChange={f('semester')}  className={inputCls} placeholder="1" /></FormField>
              <FormField label="Section">   <input type="text"   value={form.section}   onChange={f('section')}   className={inputCls} placeholder="A" /></FormField>
              <FormField label="Phone">     <input type="text"   value={form.phone}     onChange={f('phone')}     className={inputCls} placeholder="+1 555 0100" /></FormField>
              <FormField label="Address">   <input type="text"   value={form.address}   onChange={f('address')}   className={inputCls} placeholder="123 Main St" /></FormField>
            </div>
            <ModalActions onCancel={() => setModal(null)} loading={loading} saveLabel={modal === 'add' ? 'Add Student' : 'Save Changes'} />
          </form>
        </Modal>
      )}

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
                {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
              </select>
            </FormField>
            <div className="flex gap-3 justify-end pt-2">
              <SecondaryBtn type="button" onClick={() => setModal(null)}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>Enroll</PrimaryBtn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
