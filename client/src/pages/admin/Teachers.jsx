import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, SearchBar, Card, TableHead, EmptyRow, Avatar, Badge, FormField, ModalActions, IconBtn, inputCls } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', password: '', teacherId: '', phone: '', address: '' };

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);

  const load = () => api.get('/admin/teachers', { params: { search } }).then(r => setTeachers(r.data));
  useEffect(() => { load(); }, [search]);

  const openAdd  = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (t) => { setForm({ ...t, password: '' }); setSelected(t); setModal('edit'); };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modal === 'add') { await api.post('/admin/teachers', form); toast.success('Teacher added'); }
      else { await api.put(`/admin/teachers/${selected._id}`, form); toast.success('Teacher updated'); }
      load(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this teacher?')) return;
    await api.delete(`/admin/teachers/${id}`);
    toast.success('Teacher deactivated'); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search teachers..." />
        <PrimaryBtn onClick={openAdd}><Plus size={15} /> Add Teacher</PrimaryBtn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead cols={['Teacher', 'Teacher ID', 'Phone', 'Status', 'Actions']} />
            <tbody>
              {teachers.length === 0 && <EmptyRow cols={5} message="No teachers found" />}
              {teachers.map((t, i) => (
                <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.name} index={i + 10} />
                      <div>
                        <p className="font-semibold text-slate-700 text-[13px]">{t.name}</p>
                        <p className="text-[11px] text-slate-400">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><Badge color="slate">{t.teacherId || '—'}</Badge></td>
                  <td className="px-4 py-3.5 text-[13px] text-slate-500">{t.phone || '—'}</td>
                  <td className="px-4 py-3.5"><Badge color="green">Active</Badge></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <IconBtn icon={Edit2}  onClick={() => openEdit(t)}   color="slate" title="Edit" />
                      <IconBtn icon={Trash2} onClick={() => handleDelete(t._id)} color="red" title="Deactivate" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Teacher' : 'Edit Teacher'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Full Name"><input required type="text"     value={form.name}      onChange={f('name')}      className={inputCls} placeholder="Jane Smith" /></FormField>
              <FormField label="Email">   <input required type="email"    value={form.email}     onChange={f('email')}     className={inputCls} placeholder="jane@school.edu" /></FormField>
              <FormField label={modal === 'add' ? 'Password' : 'New Password (optional)'}>
                <input type="password" required={modal === 'add'} value={form.password} onChange={f('password')} className={inputCls} placeholder="••••••••" />
              </FormField>
              <FormField label="Teacher ID"><input type="text" value={form.teacherId || ''} onChange={f('teacherId')} className={inputCls} placeholder="TCH001" /></FormField>
              <FormField label="Phone">    <input type="text" value={form.phone    || ''} onChange={f('phone')}     className={inputCls} placeholder="+1 555 0101" /></FormField>
              <FormField label="Address">  <input type="text" value={form.address  || ''} onChange={f('address')}   className={inputCls} placeholder="456 Oak Ave" /></FormField>
            </div>
            <ModalActions onCancel={() => setModal(null)} loading={loading} saveLabel={modal === 'add' ? 'Add Teacher' : 'Save Changes'} />
          </form>
        </Modal>
      )}
    </div>
  );
}
