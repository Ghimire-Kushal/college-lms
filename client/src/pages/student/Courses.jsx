import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/courses')
      .then(r => setCourses(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">No courses enrolled yet. Contact your admin.</div>}
      {courses.map(c => (
        <div key={c._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{c.name}</h3>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{c.code}</span>
            </div>
          </div>
          {c.description && <p className="text-xs text-gray-500 mb-3">{c.description}</p>}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Sem {c.semester} {c.section ? `· ${c.section}` : ''} · {c.credits} credits</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-50">
            <p className="text-xs text-gray-500">Teacher: <span className="font-medium text-gray-700">{c.teacher?.name || 'Not assigned'}</span></p>
            {c.teacher?.email && <p className="text-xs text-gray-400">{c.teacher.email}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
