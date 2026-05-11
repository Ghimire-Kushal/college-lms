import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function StudentNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/notices')
      .then(r => setNotices(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  const roleColors = { admin: 'bg-red-50 text-red-700', teacher: 'bg-purple-50 text-purple-700', student: 'bg-blue-50 text-blue-700' };

  return (
    <div className="space-y-3">
      {notices.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">No notices</div>}
      {notices.map(n => (
        <div key={n._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-gray-800">{n.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${roleColors[n.postedBy?.role] || 'bg-gray-100 text-gray-600'}`}>
                  {n.postedBy?.role}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{n.content}</p>
              <p className="text-xs text-gray-400 mt-2">Posted by {n.postedBy?.name} · {new Date(n.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
