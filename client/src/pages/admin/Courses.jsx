import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserPlus, BookOpen, Users, ArrowLeft, GraduationCap } from 'lucide-react';
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

export default function Courses() {
  const [courses, setCourses]     = useState([]);
  const [teachers, setTeachers]   = useState([]);
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [selected, setSelected]   = useState(null);
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading]     = useState(false);

  // Navigation state
  const [activeFaculty, setActiveFaculty] = useState(null); // null = show faculty grid
  const [activeClass, setActiveClass]     = useState(11);

  const load = () => api.get('/admin/courses').then(r => setCourses(r.data));
  useEffect(() => { load(); api.get('/admin/teachers').then(r => setTeachers(r.data)); }, []);

  const openAdd    = (stream = '', grade = '') => { setForm({ ...emptyForm, stream, grade: String(grade) }); setModal('add'); };
  const openEdit   = (c) => { setForm({ ...c }); setSelected(c); setModal('edit'); };
  const openAssign = (c) => { setSelected(c); setTeacherId(c.teacher?._id || ''); setModal('assign'); };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      modal === 'add'
        ? (await api.post('/admin/courses', form),         toast.success('Subject added'))
        : (await api.put(`/admin/courses/${selected._id}`, form), toast.success('Subject updated'));
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
    (acc[c.stream][c.grade] = acc[c.stream][c.grade] || []).push(c);
    return acc;
  }, {});

  // Build faculty summary list (include streams that have no courses yet)
  const allFaculties = STREAMS.map(s => ({
    name:    s,
    meta:    FACULTY_META[s] || { icon: '📖', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
    count11: (grouped[s]?.[11] || []).length,
    count12: (grouped[s]?.[12] || []).length,
    total:   ((grouped[s]?.[11] || []).length) + ((grouped[s]?.[12] || []).length),
  }));

  const facultyMeta = activeFaculty
    ? (FACULTY_META[activeFaculty] || { icon: '📖', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' })
    : null;
  const classList = activeFaculty ? (grouped[activeFaculty] || {}) : {};
  const currentSubjects = classList[activeClass] || [];

  /* ════════════════════════════════════════════════
     VIEW 1 — Faculty grid
  ════════════════════════════════════════════════ */
  if (!activeFaculty) {
    return (
      <div className="space-y-5">
        <PageHeader title="Subjects" subtitle="Select a faculty to manage its subjects.">
          <PrimaryBtn onClick={() => openAdd()}><Plus size={15} /> Add Subject</PrimaryBtn>
        </PageHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {allFaculties.map(({ name, meta, count11, count12, total }) => (
            <button
              key={name}
              onClick={() => { setActiveFaculty(name); setActiveClass(11); }}
              className="group bg-white border border-slate-200 rounded-2xl p-5 text-left hover:shadow-lg hover:border-slate-300 transition-all"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 border"
                style={{ background: meta.bg, borderColor: meta.border }}>
                {meta.icon}
              </div>

              {/* Name */}
              <p className="text-[15px] font-bold text-slate-800 leading-tight">{name}</p>

              {/* Counts */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-400">Class 11</span>
                  <span className="font-semibold" style={{ color: meta.color }}>{count11} subjects</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-400">Class 12</span>
                  <span className="font-semibold" style={{ color: meta.color }}>{count12} subjects</span>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[12px] text-slate-400">{total} total</span>
                <span className="text-[12px] font-semibold opacity-0 group-hover:opacity-100 transition"
                  style={{ color: meta.color }}>
                  Open →
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Modals */}
        {(modal === 'add' || modal === 'edit') && renderFormModal(modal, form, f, handleSave, loading, setModal)}
        {modal === 'assign' && renderAssignModal(selected, teacherId, setTeacherId, teachers, handleAssign, setModal)}
      </div>
    );
  }

  /* ════════════════════════════════════════════════
     VIEW 2 — Faculty detail with Class 11 / 12
  ════════════════════════════════════════════════ */
  return (
    <div className="space-y-5">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveFaculty(null)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <ArrowLeft size={15} /> All Faculties
          </button>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-2">
            <span className="text-xl">{facultyMeta.icon}</span>
            <span className="text-[15px] font-bold text-slate-800">{activeFaculty}</span>
          </div>
        </div>
        <PrimaryBtn onClick={() => openAdd(activeFaculty, activeClass)}>
          <Plus size={15} /> Add to Class {activeClass}
        </PrimaryBtn>
      </div>

      {/* Faculty hero card */}
      <div className="rounded-2xl p-5 sm:p-6 border"
        style={{ background: facultyMeta.bg, borderColor: facultyMeta.border }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-white border shadow-sm"
            style={{ borderColor: facultyMeta.border }}>
            {facultyMeta.icon}
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-slate-800">{activeFaculty}</h2>
            <p className="text-[13px] text-slate-500 mt-1">
              Class 11: <strong style={{ color: facultyMeta.color }}>{(classList[11] || []).length}</strong> subjects
              &nbsp;·&nbsp;
              Class 12: <strong style={{ color: facultyMeta.color }}>{(classList[12] || []).length}</strong> subjects
            </p>
          </div>
        </div>
      </div>

      {/* Class 11 / 12 tabs */}
      <div className="flex gap-2">
        {[11, 12].map(g => {
          const cnt   = (classList[g] || []).length;
          const isAct = activeClass === g;
          return (
            <button
              key={g}
              onClick={() => setActiveClass(g)}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-[14px] font-semibold transition-all border"
              style={isAct
                ? { background: facultyMeta.color, color: '#fff',     borderColor: facultyMeta.color }
                : { background: '#ffffff',          color: '#64748b', borderColor: '#e2e8f0' }
              }
            >
              <GraduationCap size={15} />
              Class {g}
              <span className="text-[12px] px-2 py-0.5 rounded-full font-medium"
                style={isAct
                  ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                  : { background: '#f1f5f9', color: '#64748b' }
                }>
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Subjects */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {currentSubjects.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <BookOpen size={32} className="mb-3 opacity-40" />
            <p className="text-[14px] font-medium">No subjects in Class {activeClass}</p>
            <p className="text-[12px] mt-1 text-slate-400">Add the first subject for this class.</p>
            <button
              onClick={() => openAdd(activeFaculty, activeClass)}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold border-2 border-dashed transition hover:opacity-80"
              style={{ color: facultyMeta.color, borderColor: facultyMeta.border }}
            >
              <Plus size={14} /> Add subject
            </button>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4">Subject</div>
              <div className="col-span-2">Code</div>
              <div className="col-span-2 text-center">Students</div>
              <div className="col-span-2">Teacher</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100">
              {currentSubjects.map((c, i) => (
                <div key={c._id}
                  className="group grid grid-cols-12 items-center px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="col-span-1 text-center text-[12px] font-bold text-slate-300">{i + 1}</div>

                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                      style={{ background: facultyMeta.color }}>
                      {c.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">{c.name}</p>
                      {c.description && (
                        <p className="text-[11px] text-slate-400 truncate">{c.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{c.code}</span>
                    {c.section && <span className="ml-1 text-[11px] text-slate-400">§{c.section}</span>}
                  </div>

                  <div className="col-span-2 flex items-center justify-center gap-1 text-[12px] text-slate-500">
                    <Users size={12} className="text-slate-400" />
                    {c.students?.length || 0}
                  </div>

                  <div className="col-span-2 flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ background: c.teacher ? facultyMeta.color : '#cbd5e1' }}>
                      {c.teacher?.name?.[0] || '?'}
                    </div>
                    <span className="text-[12px] text-slate-500 truncate">
                      {c.teacher?.name || <span className="italic text-rose-400">Unassigned</span>}
                    </span>
                  </div>

                  <div className="col-span-1 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconBtn icon={UserPlus} onClick={() => openAssign(c)} color="blue"  title="Assign Teacher" />
                    <IconBtn icon={Edit2}    onClick={() => openEdit(c)}   color="slate" title="Edit" />
                    <IconBtn icon={Trash2}   onClick={() => handleDelete(c._id)} color="red" title="Delete" />
                  </div>
                </div>
              ))}
            </div>

            {/* Add row footer */}
            <div className="px-5 py-3 border-t border-slate-100">
              <button
                onClick={() => openAdd(activeFaculty, activeClass)}
                className="flex items-center gap-2 text-[12px] font-medium text-slate-400 hover:text-slate-700 transition"
              >
                <Plus size={13} /> Add subject to Class {activeClass}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {(modal === 'add' || modal === 'edit') && renderFormModal(modal, form, f, handleSave, loading, setModal)}
      {modal === 'assign' && renderAssignModal(selected, teacherId, setTeacherId, teachers, handleAssign, setModal)}
    </div>
  );
}

/* ── Shared modal renderers ──────────────────────────── */
function renderFormModal(modal, form, f, handleSave, loading, setModal) {
  return (
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
              {['Science','Management','Humanities','Education','Law','Computer Science','Hotel Management'].map(s =>
                <option key={s} value={s}>{s}</option>
              )}
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
  );
}

function renderAssignModal(selected, teacherId, setTeacherId, teachers, handleAssign, setModal) {
  return (
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
  );
}
