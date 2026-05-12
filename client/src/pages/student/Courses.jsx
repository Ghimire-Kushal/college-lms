import { useState, useEffect } from 'react';
import { BookOpen, User } from 'lucide-react';
import { Badge, PageHeader } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const COLORS = ['from-indigo-500 to-indigo-600','from-violet-500 to-purple-600','from-sky-500 to-blue-600','from-emerald-500 to-teal-600','from-rose-500 to-pink-600','from-amber-500 to-orange-500'];

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/courses')
      .then(r => setCourses(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-5">
      <PageHeader title="My Courses" subtitle="Courses you are enrolled in this semester." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-44 animate-pulse bg-slate-100 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="My Courses" subtitle="Courses you are enrolled in this semester." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {courses.length === 0 && (
        <div className="col-span-3 bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <BookOpen size={36} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">No courses enrolled</p>
          <p className="text-sm text-slate-400 mt-1">Contact your admin to enroll in courses.</p>
        </div>
      )}
      {courses.map((c, i) => (
        <div key={c._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden card-hover" style={{ animationDelay: `${i * 0.05}s` }}>
          <div className={`h-1.5 bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                {c.code?.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-[14px] truncate">{c.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge color="indigo">{c.code}</Badge>
                  <Badge color="slate">Sem {c.semester}</Badge>
                </div>
              </div>
            </div>

            {c.description && <p className="text-[12px] text-slate-500 mb-3 line-clamp-2">{c.description}</p>}

            <div className="flex items-center gap-3 text-[12px] text-slate-500 mb-3">
              {c.section && <span>Section {c.section}</span>}
              <span>{c.credits} credits</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                {c.teacher?.name?.[0] || <User size={10} />}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-slate-700 truncate">{c.teacher?.name || 'Not assigned'}</p>
                {c.teacher?.email && <p className="text-[10px] text-slate-400 truncate">{c.teacher.email}</p>}
              </div>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
