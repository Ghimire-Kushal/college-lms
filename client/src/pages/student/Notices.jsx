import { useState, useEffect } from 'react';
import { Bell, Megaphone } from 'lucide-react';
import { Badge, PageHeader } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const posterColor = { admin: 'red', teacher: 'violet', student: 'blue' };

export default function StudentNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/notices')
      .then(r => setNotices(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-5">
      <PageHeader title="Notices" subtitle="Announcements from admins and teachers." />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 animate-pulse bg-slate-100 rounded-2xl" />)}
      </div>
    </div>
  );

  if (notices.length === 0) return (
    <div className="space-y-5">
      <PageHeader title="Notices" subtitle="Announcements from admins and teachers." />
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
        <Megaphone size={36} className="mx-auto text-slate-200 mb-3" />
        <p className="text-slate-500 font-medium">No notices yet</p>
        <p className="text-sm text-slate-400 mt-1">You'll be notified when admins or teachers post announcements.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Notices" subtitle="Announcements from admins and teachers." />
      <div className="space-y-3">
      {notices.map((n, i) => (
        <div key={n._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `hsl(${(i * 73 + 210) % 360}, 60%, 94%)` }}>
              <Bell size={15} style={{ color: `hsl(${(i * 73 + 210) % 360}, 60%, 45%)` }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-800 text-[14px]">{n.title}</h3>
                <Badge color={posterColor[n.postedBy?.role] || 'slate'}>
                  {n.postedBy?.role === 'admin' ? 'Admin' : n.postedBy?.role === 'teacher' ? 'Teacher' : 'Notice'}
                </Badge>
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed">{n.content}</p>
              <p className="text-[11px] text-slate-400 mt-2">
                By <span className="font-medium text-slate-500">{n.postedBy?.name}</span>
                {' · '}
                {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
