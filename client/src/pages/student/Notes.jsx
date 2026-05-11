import { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function StudentNotes() {
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/courses').then(r => setCourses(r.data));
  }, []);

  useEffect(() => {
    api.get('/student/notes', { params: { courseId: filter } })
      .then(r => setNotes(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">No notes available</div>}
        {notes.map(n => (
          <div key={n._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{n.title}</h3>
                <p className="text-xs text-indigo-600">{n.course?.name}</p>
              </div>
            </div>
            {n.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{n.description}</p>}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">By {n.teacher?.name}</p>
                <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
              {n.fileUrl ? (
                <a href={n.fileUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100">
                  <Download size={12} /> Download
                </a>
              ) : (
                <span className="text-xs text-gray-400 italic">No file</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
