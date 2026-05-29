import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, SearchBar, Card, TableHead, EmptyRow, Avatar, Badge, FormField, ModalActions, IconBtn, PageHeader, inputCls } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', email: '', password: '', teacherId: '',
  phone: '', address: '', department: '', qualification: '', subjects: '',
};

export default function Teachers() {
  const [teachers, setTeachers]   = useState([]);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [expanded, setExpanded]   = useState(null);

  const load = () =>
    api.get('/admin/teachers', { params: { search } }).then(r => setTeachers(r.data));

  useEffect(() => { load(); }, [search]);

  const openAdd  = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (t) => {
    setForm({ ...t, password: '', subjects: (t.subjects || []).join(', ') });
    setSelected(t);
    setModal('edit');
  };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        subjects: form.subjects ? form.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (modal === 'add') {
        await api.post('/admin/teachers', payload);
        toast.success('Teacher added');
      } else {
        await api.put(`/admin/teachers/${selected._id}`, payload);
        toast.success('Teacher updated');
      }
      load(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this teacher?')) return;
    await api.delete(`/admin/teachers/${id}`);
    toast.success('Teacher deactivated'); load();
  };

  const toggleExpand = (id) => setExpanded(prev => (prev === id ? null : id));

  return (
    <div className="space-y-5">
      <PageHeader title="Teachers" subtitle="Manage faculty members, subjects, and course assignments.">
        <PrimaryBtn onClick={openAdd}><Plus size={15} /> Add Teacher</PrimaryBtn>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, ID, department..." />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead cols={['Teacher', 'ID / Dept', 'Subjects', 'Courses Assigned', 'Status', 'Actions']} />
            <tbody>
              {teachers.length === 0 && <EmptyRow cols={6} message="No teachers found" />}
              {teachers.map((t, i) => (
                <>
                  <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    {/* Teacher info */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={t.name} index={i + 10} />
                        <div>
                          <p className="font-semibold text-slate-700 text-[13px]">{t.name}</p>
                          <p className="text-[11px] text-slate-400">{t.email}</p>
                          {t.qualification && (
                            <p className="text-[11px] text-indigo-400 mt-0.5">{t.qualification}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ID & Department */}
                    <td className="px-4 py-3.5">
                      <Badge color="slate">{t.teacherId || '—'}</Badge>
                      {t.department && (
                        <p className="text-[11px] text-slate-500 mt-1">{t.department}</p>
                      )}
                    </td>

                    {/* Subjects */}
                    <td className="px-4 py-3.5">
                      {t.subjects?.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {t.subjects.map(s => (
                            <Badge key={s} color="indigo">{s}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[12px] italic">None assigned</span>
                      )}
                    </td>

                    {/* Assigned Courses */}
                    <td className="px-4 py-3.5">
                      {t.assignedCourses?.length > 0 ? (
                        <button
                          onClick={() => toggleExpand(t._id)}
                          className="flex items-center gap-1 text-[12px] text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <BookOpen size={13} />
                          {t.assignedCourses.length} course{t.assignedCourses.length > 1 ? 's' : ''}
                          {expanded === t._id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[12px] italic">No courses</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5"><Badge color="green">Active</Badge></td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <IconBtn icon={Edit2}  onClick={() => openEdit(t)}        color="slate" title="Edit" />
                        <IconBtn icon={Trash2} onClick={() => handleDelete(t._id)} color="red"   title="Deactivate" />
                      </div>
                    </td>
                  </tr>

                  {/* Expanded courses row */}
                  {expanded === t._id && t.assignedCourses?.length > 0 && (
                    <tr key={`${t._id}-courses`} className="bg-indigo-50/50">
                      <td colSpan={6} className="px-8 py-3">
                        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mb-2">
                          Assigned Courses
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {t.assignedCourses.map(c => (
                            <div key={c._id} className="flex items-center gap-1.5 bg-white border border-indigo-100 rounded-lg px-3 py-1.5 text-[12px]">
                              <BookOpen size={12} className="text-indigo-400" />
                              <span className="font-semibold text-slate-700">{c.name}</span>
                              <Badge color="indigo">{c.code}</Badge>
                              <Badge color="slate">Class {c.grade}</Badge>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Teacher' : 'Edit Teacher'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Full Name">
                <input required type="text" value={form.name} onChange={f('name')} className={inputCls} placeholder="Dr. Jane Smith" />
              </FormField>
              <FormField label="Email">
                <input required type="email" value={form.email} onChange={f('email')} className={inputCls} placeholder="jane@school.edu" />
              </FormField>
              <FormField label={modal === 'add' ? 'Password' : 'New Password (optional)'}>
                <input type="password" required={modal === 'add'} value={form.password} onChange={f('password')} className={inputCls} placeholder="••••••••" />
              </FormField>
              <FormField label="Teacher ID">
                <input type="text" value={form.teacherId || ''} onChange={f('teacherId')} className={inputCls} placeholder="TCH001" />
              </FormField>
              <FormField label="Department">
                <input type="text" value={form.department || ''} onChange={f('department')} className={inputCls} placeholder="Computer Science" />
              </FormField>
              <FormField label="Qualification">
                <input type="text" value={form.qualification || ''} onChange={f('qualification')} className={inputCls} placeholder="Ph.D. in Computer Science" />
              </FormField>
              <FormField label="Phone">
                <input type="text" value={form.phone || ''} onChange={f('phone')} className={inputCls} placeholder="+1 555 0101" />
              </FormField>
              <FormField label="Address">
                <input type="text" value={form.address || ''} onChange={f('address')} className={inputCls} placeholder="456 Oak Ave" />
              </FormField>
              <div className="col-span-2">
                <FormField label="Subjects (comma-separated)" >
                  <input
                    type="text"
                    value={form.subjects || ''}
                    onChange={f('subjects')}
                    className={inputCls}
                    placeholder="e.g. Database Systems, Web Technology, Data Structures"
                  />
                </FormField>
              </div>
            </div>
            <ModalActions onCancel={() => setModal(null)} loading={loading} saveLabel={modal === 'add' ? 'Add Teacher' : 'Save Changes'} />
          </form>
        </Modal>
      )}
    </div>
  );
}
