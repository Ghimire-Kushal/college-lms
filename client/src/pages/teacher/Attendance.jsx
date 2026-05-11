import { useState, useEffect } from 'react';
import { Plus, Eye } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function TeacherAttendance() {
  const [courses, setCourses] = useState([]);
  const [records, setRecords] = useState([]);
  const [modal, setModal] = useState(null); // 'take' | 'summary'
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filterCourse, setFilterCourse] = useState('');

  const loadCourses = () => api.get('/teacher/courses').then(r => setCourses(r.data));
  const loadRecords = () => api.get('/teacher/attendance', { params: { courseId: filterCourse } }).then(r => setRecords(r.data));

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { loadRecords(); }, [filterCourse]);

  const openTake = async () => {
    if (!selectedCourse) return toast.error('Select a course first');
    const course = courses.find(c => c._id === selectedCourse);
    setAttendance(course?.students?.map(s => ({ student: s._id, status: 'present', name: s.name, studentId: s.studentId })) || []);
    setModal('take');
  };

  const openSummary = async (courseId) => {
    const r = await api.get(`/teacher/attendance/summary/${courseId}`);
    setSummary(r.data);
    setModal('summary');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teacher/attendance', {
        courseId: selectedCourse,
        date,
        records: attendance.map(a => ({ student: a.student, status: a.status })),
      });
      toast.success('Attendance submitted');
      loadRecords();
      setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const toggle = (id, status) => {
    setAttendance(a => a.map(s => s.student === id ? { ...s, status } : s));
  };

  const statusBtn = (current, value, label, color) => (
    <button type="button" onClick={() => toggle(current.student, value)}
      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${current.status === value ? color : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
      {label}
    </button>
  );

  const pct = (s) => s.total > 0 ? ((s.present + s.late * 0.5) / s.total * 100).toFixed(1) : 0;

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Select Course</label>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">-- Choose course --</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button onClick={openTake} disabled={!selectedCourse}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            <Plus size={16} /> Take Attendance
          </button>
        </div>
      </div>

      {/* Summary by course */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (
          <div key={c._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-sm">{c.name}</h3>
              <button onClick={() => openSummary(c._id)} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                <Eye size={12} /> Summary
              </button>
            </div>
            <p className="text-xs text-gray-400">{c.students?.length || 0} students enrolled</p>
          </div>
        ))}
      </div>

      {/* Records */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Attendance History</span>
          <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
            className="ml-auto px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="divide-y divide-gray-50">
          {records.length === 0 && <p className="text-center py-6 text-gray-400 text-sm">No records yet</p>}
          {records.map(r => {
            const presentCount = r.records?.filter(x => x.status === 'present').length || 0;
            const total = r.records?.length || 0;
            return (
              <div key={r._id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{r.course?.name}</p>
                  <p className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-green-600">{presentCount}</span>
                  <span className="text-gray-400">/{total} present</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Take Attendance Modal */}
      {modal === 'take' && (
        <Modal title="Take Attendance" onClose={() => setModal(null)} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <span>Course: <strong>{courses.find(c => c._id === selectedCourse)?.name}</strong></span>
              <span>Date: <strong>{date}</strong></span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {attendance.map(s => (
                <div key={s.student} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                  <div className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">{s.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.studentId}</p>
                  </div>
                  <div className="flex gap-1">
                    {statusBtn(s, 'present', 'P', 'bg-green-100 text-green-700')}
                    {statusBtn(s, 'absent', 'A', 'bg-red-100 text-red-700')}
                    {statusBtn(s, 'late', 'L', 'bg-yellow-100 text-yellow-700')}
                  </div>
                </div>
              ))}
              {attendance.length === 0 && <p className="text-center py-4 text-gray-400 text-sm">No students enrolled in this course</p>}
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Summary Modal */}
      {modal === 'summary' && summary && (
        <Modal title={`Attendance Summary – ${summary.course?.name}`} onClose={() => setModal(null)} size="lg">
          <div className="text-sm text-gray-500 mb-4">Total classes held: <strong className="text-gray-700">{summary.totalClasses}</strong></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Student', 'ID', 'Present', 'Absent', 'Late', 'Attendance %'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.summary?.map(s => (
                  <tr key={s.student._id}>
                    <td className="px-3 py-2 font-medium text-gray-700">{s.student.name}</td>
                    <td className="px-3 py-2 text-gray-500">{s.student.studentId}</td>
                    <td className="px-3 py-2 text-green-600">{s.present}</td>
                    <td className="px-3 py-2 text-red-600">{s.absent}</td>
                    <td className="px-3 py-2 text-yellow-600">{s.late}</td>
                    <td className="px-3 py-2">
                      <span className={`font-semibold ${parseFloat(pct(s)) < 75 ? 'text-red-600' : 'text-green-600'}`}>{pct(s)}%</span>
                      {parseFloat(pct(s)) < 75 && <span className="ml-1 text-xs text-red-500">⚠ Low</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}
