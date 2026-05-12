import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserPlus, BookOpen } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, SecondaryBtn, Card, FormField, ModalActions, IconBtn, inputCls, selectCls, Badge } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { name: '', code: '', description: '', credits: 3, semester: '', section: '' };

const COURSE_COLORS = [
  'from-indigo-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
];

export default function Courses() {
  const [courses, setCourses]   = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading]   = useState(false);

  const load = () => api.get('/admin/courses').then(r => setCourses(r.data));
  useEffect(() => { load(); api.get('/admin/teachers').then(r => setTeachers(r.data)); }, []);

  const openAdd    = () => { setForm(emptyForm); setModal('add'); };
  const openEdit   = (c) => { setForm(c); setSelected(c); setModal('edit'); };
  const openAssign = (c) => { setSelected(c); setTeacherId(c.teacher?._id || ''); setModal('assign'); };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modal === 'add') { await api.post('/admin/courses', form); toast.success('Course created'); }
      else { await api.put(`/admin/courses/${selected._id}`, form); toast.success('Course updated'); }
      load(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    await api.patch(`/admin/courses/${selected._id}/assign-teacher`, { teacherId });
    toast.success('Teacher assigned'); load(); setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this course?')) return;
    await api.delete(`/admin/courses/${id}`);
    toast.success('Course deactivated'); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <PrimaryBtn onClick={openAdd}><Plus size={15} /> Add Course</PrimaryBtn>
      </div>

      {courses.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <BookOpen size={40} className="mb-3" />
            <p className="text-slate-500 font-medium">No courses yet</p>
            <p className="text-sm text-slate-400 mt-1">Click "Add Course" to create your first course.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c, i) => (
          <div key={c._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden card-hover">
            {/* Color header */}
            <div className={`h-2 bg-gradient-to-r ${COURSE_COLORS[i % COURSE_COLORS.length]}`} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-[15px] truncate">{c.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge color="indigo">{c.code}</Badge>
                    <Badge color="slate">Sem {c.semester}</Badge>
                    {c.section && <Badge color="slate">§{c.section}</Badge>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <IconBtn icon={UserPlus} onClick={() => openAssign(c)} color="blue"  title="Assign Teacher" />
                  <IconBtn icon={Edit2}    onClick={() => openEdit(c)}   color="slate" title="Edit" />
                  <IconBtn icon={Trash2}   onClick={() => handleDelete(c._id)} color="red" title="Delete" />
                </div>
              </div>

              {c.description && (
                <p className="text-[12px] text-slate-500 mb-3 line-clamp-2">{c.description}</p>
              )}

              <div className="flex items-center justify-between text-[12px] text-slate-500 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">{c.credits}</span> credits
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">{c.students?.length || 0}</span> students
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] font-bold">
                    {c.teacher?.name?.[0] || '?'}
                  </div>
                  <span className="text-[11px] text-slate-500 truncate max-w-[100px]">
                    {c.teacher?.name || <span className="text-rose-400 italic">Unassigned</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Course' : 'Edit Course'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Course Name">
                <input required type="text" value={form.name} onChange={f('name')} className={inputCls} placeholder="Introduction to CS" />
              </FormField>
              <FormField label="Course Code">
                <input required type="text" value={form.code} onChange={f('code')} className={inputCls} placeholder="CS101" />
              </FormField>
              <FormField label="Semester">
                <input required type="number" value={form.semester} onChange={f('semester')} className={inputCls} placeholder="1" />
              </FormField>
              <FormField label="Section">
                <input type="text" value={form.section} onChange={f('section')} className={inputCls} placeholder="A" />
              </FormField>
              <FormField label="Credits">
                <input type="number" value={form.credits} onChange={f('credits')} className={inputCls} placeholder="3" />
              </FormField>
              <div className="col-span-2">
                <FormField label="Description">
                  <input type="text" value={form.description} onChange={f('description')} className={inputCls} placeholder="Brief course description" />
                </FormField>
              </div>
            </div>
            <ModalActions onCancel={() => setModal(null)} loading={loading} saveLabel={modal === 'add' ? 'Create Course' : 'Save Changes'} />
          </form>
        </Modal>
      )}

      {modal === 'assign' && (
        <Modal title={`Assign Teacher — ${selected?.name}`} onClose={() => setModal(null)} size="sm">
          <form onSubmit={handleAssign} className="space-y-4">
            <FormField label="Select Teacher">
              <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className={selectCls}>
                <option value="">— No teacher (unassign) —</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </FormField>
            <div className="flex gap-3 justify-end pt-2">
              <SecondaryBtn type="button" onClick={() => setModal(null)}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit">Assign</PrimaryBtn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
