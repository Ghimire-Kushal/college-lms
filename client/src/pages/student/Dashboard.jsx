import { useState, useEffect } from 'react';
import { BookOpen, UserCheck, ClipboardList, Bell } from 'lucide-react';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  const attPct = parseFloat(data?.attendancePercentage || 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Enrolled Courses" value={data?.totalCourses ?? 0} icon={BookOpen} color="indigo" />
        <StatCard title="Attendance" value={`${attPct}%`} icon={UserCheck} color={attPct >= 75 ? 'green' : 'red'} subtitle={attPct < 75 ? '⚠ Below 75%' : 'Good standing'} />
        <StatCard title="Classes Attended" value={`${data?.presentClasses ?? 0}/${data?.totalClasses ?? 0}`} icon={UserCheck} color="blue" />
        <StatCard title="Upcoming Assignments" value={data?.upcomingAssignments?.length ?? 0} icon={ClipboardList} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Upcoming Assignments</h2>
          <div className="space-y-3">
            {data?.upcomingAssignments?.length === 0 && <p className="text-gray-400 text-sm">No upcoming assignments</p>}
            {data?.upcomingAssignments?.map(a => {
              const daysLeft = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.title}</p>
                    <p className="text-xs text-gray-400">{a.course?.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${daysLeft <= 2 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                    {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Courses */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">My Courses</h2>
          <div className="space-y-2">
            {data?.courses?.length === 0 && <p className="text-gray-400 text-sm">No courses enrolled</p>}
            {data?.courses?.map(c => (
              <div key={c._id} className="flex items-center gap-3 p-2.5 border border-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold">{c.code?.slice(0, 2)}</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Notices */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Notices</h2>
        <div className="space-y-3">
          {data?.notices?.length === 0 && <p className="text-gray-400 text-sm">No notices</p>}
          {data?.notices?.map(n => (
            <div key={n._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
