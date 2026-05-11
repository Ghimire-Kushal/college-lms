import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState({ courseId: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/admin/courses').then(r => setCourses(r.data)); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/attendance', { params: filter });
      setRecords(r.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const statusColor = { present: 'bg-green-100 text-green-700', absent: 'bg-red-100 text-red-700', late: 'bg-yellow-100 text-yellow-700' };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
            <select value={filter.courseId} onChange={e => setFilter(f => ({ ...f, courseId: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All Courses</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
            <input type="date" value={filter.startDate} onChange={e => setFilter(f => ({ ...f, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
            <input type="date" value={filter.endDate} onChange={e => setFilter(f => ({ ...f, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button onClick={load} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Filter</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
      ) : (
        <div className="space-y-4">
          {records.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">No attendance records found</div>}
          {records.map(r => (
            <div key={r._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-800">{r.course?.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({r.course?.code})</span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(r.date).toLocaleDateString()} · By {r.takenBy?.name}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs text-gray-500">Student</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-500">ID</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {r.records?.map(rec => (
                      <tr key={rec._id}>
                        <td className="px-4 py-2 font-medium text-gray-700">{rec.student?.name}</td>
                        <td className="px-4 py-2 text-gray-500">{rec.student?.studentId}</td>
                        <td className="px-4 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor[rec.status]}`}>{rec.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
