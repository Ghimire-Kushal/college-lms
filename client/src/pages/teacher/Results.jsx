import { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, Card, TableHead, EmptyRow, Avatar, Badge, FormField, ModalActions, IconBtn, inputCls, selectCls } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { student: '', course: '', semester: '', internalMarks: '', externalMarks: '', totalMarks: '', grade: '', remarks: '' };
const gradeColor = { 'A+': 'green', 'A': 'green', 'B+': 'blue', 'B': 'blue', 'C+': 'yellow', 'C': 'yellow', 'D': 'yellow', 'F': 'red' };

export default function TeacherResults() {
  const [results, setResults]           = useState([]);
  const [courses, setCourses]           = useState([]);
  const [students, setStudents]         = useState([]);
  const [modal, setModal]               = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [selected, setSelected]         = useState(null);
  const [filterCourse, setFilterCourse] = useState('');

  const load = () => api.get('/teacher/results', { params: { courseId: filterCourse } }).then(r => setResults(r.data));
  useEffect(() => {
    api.get('/teacher/courses').then(r => { setCourses(r.data); if (r.data[0]) setFilterCourse(r.data[0]._id); });
  }, []);
  useEffect(() => {
    if (filterCourse) {
      load();
      const c = courses.find(x => x._id === filterCourse);
      setStudents(c?.students || []);
    }
  }, [filterCourse, courses]);

  const openAdd  = () => { setForm({ ...emptyForm, course: filterCourse }); setModal('add'); };
  const openEdit = (r) => { setForm({ ...r, student: r.student?._id, course: r.course?._id }); setSelected(r); setModal('edit'); };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'add') { await api.post('/teacher/results', form); toast.success('Result added'); }
      else { await api.put(`/teacher/results/${selected._id}`, form); toast.success('Updated'); }
      load(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <PrimaryBtn onClick={openAdd} className="ml-auto"><Plus size={15} /> Add Result</PrimaryBtn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead cols={['Student', 'Course', 'Sem', 'Internal', 'External', 'Total', 'Grade', 'Edit']} />
            <tbody>
              {results.length === 0 && <EmptyRow cols={8} message="No results yet" />}
              {results.map((r, i) => (
                <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.student?.name} index={i} size="sm" />
                      <span className="font-semibold text-slate-700 text-[13px]">{r.student?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><Badge color="indigo">{r.course?.code}</Badge></td>
                  <td className="px-4 py-3.5 text-[13px] text-slate-600">{r.semester}</td>
                  <td className="px-4 py-3.5 text-[13px] font-medium text-slate-700">{r.internalMarks}</td>
                  <td className="px-4 py-3.5 text-[13px] font-medium text-slate-700">{r.externalMarks}</td>
                  <td className="px-4 py-3.5 text-[15px] font-bold text-slate-800">{r.totalMarks}</td>
                  <td className="px-4 py-3.5">{r.grade && <Badge color={gradeColor[r.grade] || 'slate'}>{r.grade}</Badge>}</td>
                  <td className="px-4 py-3.5"><IconBtn icon={Edit2} onClick={() => openEdit(r)} color="slate" title="Edit" /></td>
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
              <div className="col-span-2">
                <FormField label="Remarks">
                  <input type="text" value={form.remarks || ''} onChange={f('remarks')} className={inputCls} placeholder="Optional..." />
                </FormField>
              </div>
            </div>
            <ModalActions onCancel={() => setModal(null)} loading={false} saveLabel={modal === 'add' ? 'Add Result' : 'Save Changes'} />
          </form>
        </Modal>
      )}
    </div>
  );
}
