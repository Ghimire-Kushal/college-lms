import { useState, useEffect } from 'react';
import { BookOpen, Users, ClipboardList, Calendar } from 'lucide-react';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teacher/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="My Courses" value={data?.totalCourses ?? 0} icon={BookOpen} color="indigo" />
        <StatCard title="Total Students" value={data?.totalStudents ?? 0} icon={Users} color="green" />
        <StatCard title="Pending Reviews" value={data?.pendingSubmissions ?? 0} icon={ClipboardList} color="yellow" />
        <StatCard title="Recent Classes" value={data?.recentAttendance?.length ?? 0} icon={Calendar} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">My Courses</h2>
          <div className="space-y-3">
            {data?.courses?.length === 0 && <p className="text-gray-400 text-sm">No courses assigned</p>}
            {data?.courses?.map(c => (
              <div key={c._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.code}</p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{c.students?.length || 0} students</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Assignments</h2>
          <div className="space-y-3">
            {data?.recentAssignments?.length === 0 && <p className="text-gray-400 text-sm">No assignments yet</p>}
            {data?.recentAssignments?.map(a => (
              <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-400">{a.course?.name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${new Date(a.dueDate) < new Date() ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  Due {new Date(a.dueDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Attendance Records</h2>
        <div className="space-y-2">
          {data?.recentAttendance?.length === 0 && <p className="text-gray-400 text-sm">No attendance taken yet</p>}
          {data?.recentAttendance?.map(r => (
            <div key={r._id} className="flex items-center gap-3 p-3 border border-gray-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-gray-700">{r.course?.name}</span>
              <span className="text-xs text-gray-400 ml-auto">{new Date(r.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
