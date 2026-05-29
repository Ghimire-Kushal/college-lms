import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserPlus, BookOpen, Users } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, SecondaryBtn, FormField, ModalActions, IconBtn, PageHeader, inputCls, selectCls } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STREAMS = ['Science', 'Management', 'Humanities', 'Education', 'Law', 'Computer Science', 'Hotel Management'];

const FACULTY_META = {
  'Science':          { icon: '🔬', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  'Management':       { icon: '📊', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
  'Law':              { icon: '⚖️',  color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  'Computer Science': { icon: '💻', color: '#0891b2', bg: '#f0f9ff', border: '#bae6fd' },
  'Hotel Management': { icon: '🏨', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  'Humanities':       { icon: '📚', color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' },
  'Education':        { icon: '🎓', color: '#65a30d', bg: '#f7fee7', border: '#d9f99d' },
};

const emptyForm = { name: '', code: '', description: '', grade: '', stream: '', section: '' };

/* ── Subject card ─────────────────────────────────────── */
function SubjectCard({ c, meta, onEdit, onAssign, onDelete }) {
  return (
    <div className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: meta.color }}>
            {c.name[0]}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-[14px] truncate">{c.name}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{c.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <IconBtn icon={UserPlus} onClick={onAssign} color="blue"  title="Assign Teacher" />
          <IconBtn icon={Edit2}    onClick={onEdit}   color="slate" title="Edit" />
          <IconBtn icon={Trash2}   onClick={onDelete} color="red"   title="Delete" />
        </div>
      </div>

      {c.description && (
        <p className="text-[12px] text-slate-500 mt-2.5 line-clamp-1">{c.description}</p>
      )}

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <Users size={11} /> {c.students?.length || 0} students
        </span>
        {c.section && (
          <span className="text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
            §{c.section}
          </span>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
            style={{ background: c.teacher ? meta.color : '#cbd5e1' }}>
            {c.teacher?.name?.[0] || '?'}
          </div>
          <span className="text-[11px] text-slate-400 truncate max-w-[90px]">
            {c.teacher?.name || <span className="italic text-rose-400">Unassigned</span>}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────── */
export default function Courses() {
  const [courses, setCourses]     = useState([]);
  const [teachers, setTeachers]   = useState([]);
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [selected, setSelected]   = useState(null);
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading]     = useState(false);
  // Active class tab per faculty: { Science: 11, Management: 12, ... }
  const [activeTab, setActiveTab] = useState({});

  const load = () => api.get('/admin/courses').then(r => {
    setCourses(r.data);
    // Default to class 11 tab for each faculty
    const tabs = {};
    r.data.forEach(c => { if (!tabs[c.stream]) tabs[c.stream] = 11; });
    setActiveTab(prev => ({ ...tabs, ...prev }));
  });

  useEffect(() => { load(); api.get('/admin/teachers').then(r => setTeachers(r.data)); }, []);

  const openAdd    = (preStream = '', preGrade = '') => {
    setForm({ ...emptyForm, stream: preStream, grade: String(preGrade) });
    setModal('add');
  };
  const openEdit   = (c) => { setForm({ ...c }); setSelected(c); setModal('edit'); };
  const openAssign = (c) => { setSelected(c); setTeacherId(c.teacher?._id || ''); setModal('assign'); };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modal === 'add') { await api.post('/admin/courses', form); toast.success('Subject added'); }
      else { await api.put(`/admin/courses/${selected._id}`, form); toast.success('Subject updated'); }
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
    if (!confirm('Remove this subject?')) return;
    await api.delete(`/admin/courses/${id}`);
    toast.success('Subject removed'); load();
  };

  // Group by stream → grade
  const grouped = courses.reduce((acc, c) => {
    if (!acc[c.stream]) acc[c.stream] = { 11: [], 12: [] };
    if (!acc[c.stream][c.grade]) acc[c.stream][c.grade] = [];
    acc[c.stream][c.grade].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <PageHeader title="Subjects" subtitle="Organised by faculty · Class 11 & 12.">
        <PrimaryBtn onClick={() => openAdd()}><Plus size={15} /> Add Subject</PrimaryBtn>
      </PageHeader>

      {Object.keys(grouped).length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
          <BookOpen size={36} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">No subjects yet</p>
          <p className="text-sm text-slate-400 mt-1">Click "Add Subject" to get started.</p>
        </div>
      )}

      <div className="space-y-5">
        {Object.entries(grouped).map(([stream, byGrade]) => {
          const meta  = FACULTY_META[stream] || { icon: '📖', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
          const tab   = activeTab[stream] || 11;
          const list  = byGrade[tab] || [];
          const count11 = (byGrade[11] || []).length;
          const count12 = (byGrade[12] || []).length;
          const total   = count11 + count12;

          return (
            <div key={stream} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* ── Faculty header ── */}
              <div className="px-6 py-4 flex items-center gap-4" style={{ background: meta.bg, borderBottom: `1px solid ${meta.border}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-white shadow-sm border"
                  style={{ borderColor: meta.border }}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[16px] font-bold" style={{ color: meta.color }}>{stream}</h2>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {count11} subject{count11 !== 1 ? 's' : ''} in Class 11 &nbsp;·&nbsp;
                    {count12} subject{count12 !== 1 ? 's' : ''} in Class 12 &nbsp;·&nbsp;
                    <span className="font-semibold">{total} total</span>
                  </p>
                </div>
                <PrimaryBtn
                  onClick={() => openAdd(stream, tab)}
                  className="text-[12px] py-1.5 px-3 shrink-0"
                  style={{ background: meta.color }}
                >
                  <Plus size={13} /> Add to Class {tab}
                </PrimaryBtn>
              </div>

              {/* ── Class 11 / 12 toggle tabs ── */}
              <div className="flex items-center gap-0 px-6 pt-4 pb-0">
                {[11, 12].map(g => {
                  const cnt   = (byGrade[g] || []).length;
                  const isAct = tab === g;
                  return (
                    <button
                      key={g}
                      onClick={() => setActiveTab(p => ({ ...p, [stream]: g }))}
                      className="relative px-5 py-2.5 text-[13px] font-semibold rounded-t-xl transition-colors mr-1"
                      style={{
                        background:   isAct ? '#ffffff' : 'transparent',
                        color:        isAct ? meta.color : '#94a3b8',
                        border:       isAct ? `1px solid #e2e8f0` : '1px solid transparent',
                        borderBottom: isAct ? '1px solid #ffffff' : '1px solid transparent',
                        marginBottom: isAct ? '-1px' : '0',
                      }}
                    >
                      Class {g}
                      <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: isAct ? meta.bg : '#f1f5f9', color: isAct ? meta.color : '#94a3b8' }}>
                        {cnt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── Subject grid ── */}
              <div className="p-5 border-t border-slate-200">
                {list.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <BookOpen size={28} className="mb-2 opacity-40" />
                    <p className="text-sm">No subjects in Class {tab} yet</p>
                    <button
                      onClick={() => openAdd(stream, tab)}
                      className="mt-3 text-[12px] font-semibold px-4 py-1.5 rounded-lg transition hover:opacity-80"
                      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                    >
                      + Add first subject
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {list.map(c => (
                      <SubjectCard
                        key={c._id}
                        c={c}
                        meta={meta}
                        onEdit={() => openEdit(c)}
                        onAssign={() => openAssign(c)}
                        onDelete={() => handleDelete(c._id)}
                      />
                    ))}
                    {/* Quick-add tile */}
                    <button
                      onClick={() => openAdd(stream, tab)}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all min-h-[120px]"
                    >
                      <Plus size={20} />
                      <span className="text-[12px] font-medium">Add subject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add / Edit Modal ── */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Subject' : 'Edit Subject'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Subject Name">
                <input required type="text" value={form.name} onChange={f('name')} className={inputCls} placeholder="e.g. Physics" />
              </FormField>
              <FormField label="Subject Code">
                <input required type="text" value={form.code} onChange={f('code')} className={inputCls} placeholder="e.g. 11-PHY-A" />
              </FormField>
              <FormField label="Faculty / Stream">
                <select required value={form.stream} onChange={f('stream')} className={inputCls}>
                  <option value="">Select faculty…</option>
                  {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="Class">
                <select required value={form.grade} onChange={f('grade')} className={inputCls}>
                  <option value="">Select class…</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </FormField>
              <FormField label="Section (optional)">
                <input type="text" value={form.section} onChange={f('section')} className={inputCls} placeholder="A" />
              </FormField>
              <FormField label="Description (optional)">
                <input type="text" value={form.description} onChange={f('description')} className={inputCls} placeholder="Brief description" />
              </FormField>
            </div>
            <ModalActions onCancel={() => setModal(null)} loading={loading} saveLabel={modal === 'add' ? 'Add Subject' : 'Save Changes'} />
          </form>
        </Modal>
      )}

      {/* ── Assign Teacher Modal ── */}
      {modal === 'assign' && (
        <Modal title={`Assign Teacher — ${selected?.name}`} onClose={() => setModal(null)} size="sm">
          <form onSubmit={handleAssign} className="space-y-4">
            <FormField label="Select Teacher">
              <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className={selectCls}>
                <option value="">— No teacher (unassign) —</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.name}{t.department ? ` · ${t.department}` : ''}</option>)}
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
