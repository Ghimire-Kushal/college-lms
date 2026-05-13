import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, FormField, ModalActions, IconBtn, PageHeader, inputCls, selectCls } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_COLORS = ['bg-indigo-50 text-indigo-700 border-indigo-100', 'bg-sky-50 text-sky-700 border-sky-100', 'bg-emerald-50 text-emerald-700 border-emerald-100', 'bg-violet-50 text-violet-700 border-violet-100', 'bg-amber-50 text-amber-700 border-amber-100', 'bg-rose-50 text-rose-700 border-rose-100'];
const emptyForm = { course: '', teacher: '', dayOfWeek: 'Monday', startTime: '', endTime: '', room: '', semester: '', section: '' };

export default function Timetable() {
  const [entries, setEntries]   = useState([]);
  const [courses, setCourses]   = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [selected, setSelected] = useState(null);

  const load = () => api.get('/admin/timetable').then(r => setEntries(r.data));
  useEffect(() => {
    load();
    api.get('/admin/courses').then(r => setCourses(r.data));
    api.get('/admin/teachers').then(r => setTeachers(r.data));
  }, []);

  const openAdd  = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (e) => { setForm({ ...e, course: e.course?._id, teacher: e.teacher?._id }); setSelected(e); setModal('edit'); };
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'add') { await api.post('/admin/timetable', form); toast.success('Entry added'); }
      else { await api.put(`/admin/timetable/${selected._id}`, form); toast.success('Entry updated'); }
      load(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await api.delete(`/admin/timetable/${id}`);
    toast.success('Deleted'); load();
  };

  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = entries.filter(e => e.dayOfWeek === d).sort((a, b) => a.startTime?.localeCompare(b.startTime));
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <PageHeader title="Timetable" subtitle="Schedule and manage classes for each day of the week.">
        <PrimaryBtn onClick={openAdd}><Plus size={15} /> Add Entry</PrimaryBtn>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DAYS.map((day, di) => (
          <div key={day} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className={`px-4 py-3 border-b border-slate-100 flex items-center justify-between ${DAY_COLORS[di]}`}>
              <h3 className="font-bold text-[14px]">{day}</h3>
              <span className="text-[11px] font-medium opacity-60">{byDay[day].length} class{byDay[day].length !== 1 ? 'es' : ''}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {byDay[day].length === 0 ? (
                <div className="flex items-center gap-2 px-4 py-4 text-slate-300">
                  <Clock size={14} />
                  <p className="text-[12px]">No classes scheduled</p>
                </div>
              ) : byDay[day].map(e => (
                <div key={e._id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-16 shrink-0">
                    <p className="text-[11px] font-semibold text-slate-500">{e.startTime}</p>
                    <p className="text-[10px] text-slate-400">{e.endTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700 truncate">{e.course?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {e.teacher?.name}{e.room ? ` · Room ${e.room}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <IconBtn icon={Edit2}  onClick={() => openEdit(e)}    color="slate" title="Edit" />
                    <IconBtn icon={Trash2} onClick={() => handleDelete(e._id)} color="red"   title="Delete" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Timetable Entry' : 'Edit Entry'} onClose={() => setModal(null)} size="lg">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Course — full width */}
            <FormField label="Course">
              <select required value={form.course} onChange={f('course')} className={selectCls}>
                <option value="">Select a course...</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
              </select>
            </FormField>

            {/* Teacher — full width */}
            <FormField label="Teacher">
              <select required value={form.teacher} onChange={f('teacher')} className={selectCls}>
                <option value="">Select a teacher...</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </FormField>

            {/* Day + Room */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Day">
                <select value={form.dayOfWeek} onChange={f('dayOfWeek')} className={selectCls}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </FormField>
              <FormField label="Room">
                <input type="text" value={form.room} onChange={f('room')} className={inputCls} placeholder="e.g. 101" />
              </FormField>
            </div>

            {/* Start + End time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Time">
                <input type="time" value={form.startTime} onChange={f('startTime')} required className={inputCls} />
              </FormField>
              <FormField label="End Time">
                <input type="time" value={form.endTime} onChange={f('endTime')} required className={inputCls} />
              </FormField>
            </div>

            {/* Semester + Section */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Semester">
                <input type="number" min="1" max="8" value={form.semester} onChange={f('semester')} className={inputCls} placeholder="e.g. 1" />
              </FormField>
              <FormField label="Section">
                <input type="text" value={form.section} onChange={f('section')} className={inputCls} placeholder="e.g. A" />
              </FormField>
            </div>

            <ModalActions onCancel={() => setModal(null)} loading={false} saveLabel={modal === 'add' ? 'Add Entry' : 'Save Changes'} />
          </form>
        </Modal>
      )}
    </div>
  );
}
