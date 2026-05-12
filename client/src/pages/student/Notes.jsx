import { useState, useEffect } from 'react';
import { FileText, Download, BookMarked } from 'lucide-react';
import { Badge } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function StudentNotes() {
  const [notes, setNotes]     = useState([]);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/student/courses').then(r => setCourses(r.data)); }, []);
  useEffect(() => {
    setLoading(true);
    api.get('/student/notes', { params: { courseId: filter } })
      .then(r => setNotes(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [filter]);

  const fileExt = (url) => url?.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <div className="space-y-5">
      <select value={filter} onChange={e => setFilter(e.target.value)}
        className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
        <option value="">All Courses</option>
        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 animate-pulse bg-slate-100 rounded-2xl" />)}
        </div>
      )}

      {!loading && notes.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <BookMarked size={36} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">No study materials available</p>
          <p className="text-sm text-slate-400 mt-1">Your teachers haven't uploaded notes for this course yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading && notes.map((n, i) => {
          const hue = (i * 67 + 200) % 360;
          return (
            <div key={n._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden card-hover">
              <div className="h-1.5" style={{ background: `hsl(${hue}, 65%, 55%)` }} />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold"
                    style={{ background: `hsl(${hue}, 65%, 55%)` }}>
                    {n.fileUrl ? fileExt(n.fileUrl) : <FileText size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-[14px] truncate">{n.title}</h3>
                    <Badge color="indigo">{n.course?.name}</Badge>
                  </div>
                </div>
                {n.description && <p className="text-[12px] text-slate-500 mb-3 line-clamp-2">{n.description}</p>}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[11px] font-medium text-slate-600">{n.teacher?.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  {n.fileUrl ? (
                    <a href={n.fileUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors">
                      <Download size={12} /> Download
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No file</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
