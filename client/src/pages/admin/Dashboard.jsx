import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GraduationCap, Users, BookOpen, Bell } from 'lucide-react';
import StatCard from '../../components/StatCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  const chartData = data?.semesterStats?.map(s => ({ semester: `Sem ${s._id}`, students: s.count })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Students" value={data?.totalStudents ?? 0} icon={GraduationCap} color="indigo" />
        <StatCard title="Total Teachers" value={data?.totalTeachers ?? 0} icon={Users} color="green" />
        <StatCard title="Active Courses" value={data?.totalCourses ?? 0} icon={BookOpen} color="yellow" />
        <StatCard title="Notices" value={data?.totalNotices ?? 0} icon={Bell} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Students by Semester</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="semester" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="students" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Recent Students */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Recently Added Students</h2>
          <div className="space-y-3">
            {data?.recentStudents?.length === 0 && <p className="text-gray-400 text-sm">No students yet</p>}
            {data?.recentStudents?.map(s => (
              <div key={s._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.studentId} · Sem {s.semester}</p>
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
          {data?.recentNotices?.length === 0 && <p className="text-gray-400 text-sm">No notices yet</p>}
          {data?.recentNotices?.map(n => (
            <div key={n._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-400">By {n.postedBy?.name} · {new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
