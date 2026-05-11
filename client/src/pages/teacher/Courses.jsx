import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    api.get('/teacher/courses')
      .then(r => setCourses(r.data))
      .catch(() => toast.error('Failed to load courses'));
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">No courses assigned yet</div>}
        {courses.map(c => (
          <div key={c._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:border-indigo-200 transition-colors"
            onClick={() => setSelectedCourse(selectedCourse?._id === c._id ? null : c)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{c.name}</h3>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{c.code}</span>
              </div>
              <span className="flex items-center gap-1 text-sm text-gray-500"><Users size={14} />{c.students?.length || 0}</span>
            </div>
            <div className="text-xs text-gray-500">Sem {c.semester} {c.section ? `· Section ${c.section}` : ''} · {c.credits} credits</div>

            {selectedCourse?._id === c._id && c.students?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-600 mb-2">Enrolled Students</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {c.students.map(s => (
                    <div key={s._id} className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">{s.name[0]}</div>
                      <span className="text-xs text-gray-700">{s.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{s.studentId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
