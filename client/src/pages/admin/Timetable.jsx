import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const emptyForm = { course: '', teacher: '', dayOfWeek: 'Monday', startTime: '', endTime: '', room: '', semester: '', section: '' };

export default function Timetable() {
  const [entries, setEntries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);

  const load = () => api.get('/admin/timetable').then(r => setEntries(r.data));
  useEffect(() => {
    load();
    api.get('/admin/courses').then(r => setCourses(r.data));
    api.get('/admin/teachers').then(r => setTeachers(r.data));
  }, []);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (e) => { setForm({ ...e, course: e.course?._id, teacher: e.teacher?._id }); setSelected(e); setModal('edit'); };

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
    acc[d] = entries.filter(e => e.dayOfWeek === d);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {DAYS.map(day => (
          <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-indigo-50 px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-indigo-700 text-sm">{day}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {byDay[day].length === 0 ? (
                <p className="text-xs text-gray-400 px-4 py-3">No classes</p>
              ) : byDay[day].map(e => (
                <div key={e._id} className="flex items-center gap-3 px-4 py-3">
                  <div className="text-xs text-gray-500 w-24 shrink-0">{e.startTime} – {e.endTime}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{e.course?.name}</p>
                    <p className="text-xs text-gray-500">{e.teacher?.name} {e.room ? `· Room ${e.room}` : ''}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(e)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(e._id)} className="p-1 hover:bg-red-50 rounded text-red-400"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Timetable Entry' : 'Edit Entry'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
                <select required value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Select course --</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Teacher</label>
                <select required value={form.teacher} onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Select teacher --</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
                <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Room</label>
                <input value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              {[['startTime', 'Start Time', 'time'], ['endTime', 'End Time', 'time'], ['semester', 'Semester', 'number'], ['section', 'Section', 'text']].map(([key, label, type]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
