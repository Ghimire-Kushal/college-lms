import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { student: '', course: '', semester: '', internalMarks: '', externalMarks: '', totalMarks: '', grade: '', remarks: '' };

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);

  const load = () => api.get('/admin/results').then(r => setResults(r.data));
  useEffect(() => {
    load();
    api.get('/admin/students').then(r => setStudents(r.data));
    api.get('/admin/courses').then(r => setCourses(r.data));
  }, []);

  const openAdd = () => { setForm(emptyForm); setModal('add'); };
  const openEdit = (r) => { setForm({ ...r, student: r.student?._id, course: r.course?._id }); setSelected(r); setModal('edit'); };

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

  const gradeColor = { 'A+': 'text-green-700 bg-green-50', A: 'text-green-700 bg-green-50', B: 'text-blue-700 bg-blue-50', C: 'text-yellow-700 bg-yellow-50', D: 'text-orange-700 bg-orange-50', F: 'text-red-700 bg-red-50' };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Add Result
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Student', 'Course', 'Semester', 'Internal', 'External', 'Total', 'Grade', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-gray-400">No results yet</td></tr>}
              {results.map(r => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.student?.name}<br /><span className="text-xs text-gray-400">{r.student?.studentId}</span></td>
                  <td className="px-4 py-3 text-gray-600">{r.course?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.semester}</td>
                  <td className="px-4 py-3 text-gray-600">{r.internalMarks}</td>
                  <td className="px-4 py-3 text-gray-600">{r.externalMarks}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{r.totalMarks}</td>
                  <td className="px-4 py-3">
                    {r.grade && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${gradeColor[r.grade] || 'bg-gray-100 text-gray-600'}`}>{r.grade}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Result' : 'Edit Result'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Student</label>
                <select required value={form.student} onChange={e => setForm(f => ({ ...f, student: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Select --</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
                <select required value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Select --</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              {[['semester', 'Semester'], ['internalMarks', 'Internal Marks'], ['externalMarks', 'External Marks'], ['totalMarks', 'Total Marks']].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type="number" value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Grade</label>
                <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Grade --</option>
                  {['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
                <input value={form.remarks || ''} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
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
