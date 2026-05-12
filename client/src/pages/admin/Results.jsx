import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, Card, TableHead, EmptyRow, Avatar, Badge, FormField, ModalActions, IconBtn, PageHeader, inputCls, selectCls } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { student: '', course: '', semester: '', internalMarks: '', externalMarks: '', totalMarks: '', grade: '', remarks: '' };

const gradeInfo = {
  'A+': 'green', 'A': 'green', 'B+': 'blue', 'B': 'blue',
  'C+': 'yellow', 'C': 'yellow', 'D': 'yellow', 'F': 'red',
};

export default function AdminResults() {
  const [results, setResults]   = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses]   = useState([]);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [selected, setSelected] = useState(null);

  const load = () => api.get('/admin/results').then(r => setResults(r.data));
  useEffect(() => {
    load();
    api.get('/admin/students').then(r => setStudents(r.data));
    api.get('/admin/courses').then(r => setCourses(r.data));
  }, []);

  const openAdd  = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (r) => { setForm({ ...r, student: r.student?._id, course: r.course?._id }); setSelected(r); setModal('edit'); };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'add') { await api.post('/admin/results', form); toast.success('Result added'); }
      else { await api.put(`/admin/results/${selected._id}`, form); toast.success('Result updated'); }
      load(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this result?')) return;
    await api.delete(`/admin/results/${id}`);
    toast.success('Deleted'); load();
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Results" subtitle="Manage student exam results and grades.">
        <PrimaryBtn onClick={openAdd}><Plus size={15} /> Add Result</PrimaryBtn>
      </PageHeader>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead cols={['Student', 'Course', 'Semester', 'Internal', 'External', 'Total', 'Grade', 'Actions']} />
            <tbody>
              {results.length === 0 && <EmptyRow cols={8} message="No results yet" />}
              {results.map((r, i) => (
                <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.student?.name} index={i} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-700 text-[13px]">{r.student?.name}</p>
                        <p className="text-[11px] text-slate-400">{r.student?.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-slate-600">{r.course?.name}</td>
                  <td className="px-4 py-3.5"><Badge color="indigo">Sem {r.semester}</Badge></td>
                  <td className="px-4 py-3.5 text-[13px] text-slate-700 font-medium">{r.internalMarks}</td>
                  <td className="px-4 py-3.5 text-[13px] text-slate-700 font-medium">{r.externalMarks}</td>
                  <td className="px-4 py-3.5 text-[15px] font-bold text-slate-800">{r.totalMarks}</td>
                  <td className="px-4 py-3.5">
                    {r.grade && <Badge color={gradeInfo[r.grade] || 'slate'}>{r.grade}</Badge>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      <IconBtn icon={Edit2}  onClick={() => openEdit(r)}   color="slate" title="Edit" />
                      <IconBtn icon={Trash2} onClick={() => handleDelete(r._id)} color="red" title="Delete" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Result' : 'Edit Result'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Student">
                <select required value={form.student} onChange={f('student')} className={selectCls}>
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </FormField>
              <FormField label="Course">
                <select required value={form.course} onChange={f('course')} className={selectCls}>
                  <option value="">Select course...</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </FormField>
              <FormField label="Semester">      <input type="number" value={form.semester      || ''} onChange={f('semester')}      className={inputCls} /></FormField>
              <FormField label="Internal Marks"><input type="number" value={form.internalMarks || ''} onChange={f('internalMarks')} className={inputCls} /></FormField>
              <FormField label="External Marks"><input type="number" value={form.externalMarks || ''} onChange={f('externalMarks')} className={inputCls} /></FormField>
              <FormField label="Total Marks">   <input type="number" value={form.totalMarks    || ''} onChange={f('totalMarks')}    className={inputCls} /></FormField>
              <FormField label="Grade">
                <select value={form.grade} onChange={f('grade')} className={selectCls}>
                  <option value="">— Grade —</option>
                  {['A+','A','B+','B','C+','C','D','F'].map(g => <option key={g}>{g}</option>)}
                </select>
              </FormField>
              <FormField label="Remarks">
                <input type="text" value={form.remarks || ''} onChange={f('remarks')} className={inputCls} placeholder="Optional remarks..." />
              </FormField>
            </div>
            <ModalActions onCancel={() => setModal(null)} loading={false} saveLabel={modal === 'add' ? 'Add Result' : 'Save Changes'} />
          </form>
        </Modal>
      )}
    </div>
  );
}
