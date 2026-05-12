import { useState, useEffect } from 'react';
import { Users, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Card, Badge, Avatar } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const COLORS = ['from-indigo-500 to-indigo-600','from-violet-500 to-purple-600','from-sky-500 to-blue-600','from-emerald-500 to-teal-600','from-rose-500 to-pink-600','from-amber-500 to-orange-500'];

export default function TeacherCourses() {
  const [courses, setCourses]     = useState([]);
  const [expanded, setExpanded]   = useState(null);

  useEffect(() => {
    api.get('/teacher/courses')
      .then(r => setCourses(r.data))
      .catch(() => toast.error('Failed to load courses'));
  }, []);

  const toggle = (id) => setExpanded(e => e === id ? null : id);

  return (
    <div className="space-y-4">
      {courses.length === 0 && (
        <Card>
          <div className="flex flex-col items-center py-16 text-slate-300">
            <BookOpen size={40} className="mb-3" />
            <p className="text-slate-500 font-medium">No courses assigned</p>
            <p className="text-sm text-slate-400 mt-1">Contact the admin to be assigned courses.</p>
          </div>
        </Card>
      )}

      {courses.map((c, i) => {
        const isOpen = expanded === c._id;
        return (
          <div key={c._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden card-hover">
            <div className={`h-1.5 bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {c.code?.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-[15px]">{c.name}</h3>
                    <Badge color="indigo">{c.code}</Badge>
                    <Badge color="slate">Sem {c.semester}</Badge>
                    {c.section && <Badge color="slate">§{c.section}</Badge>}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[12px] text-slate-500">
                    <span className="flex items-center gap-1"><Users size={12} /> {c.students?.length || 0} students</span>
                    <span>{c.credits} credits</span>
                    {c.description && <span className="truncate max-w-xs hidden md:block">{c.description}</span>}
                  </div>
                </div>
                <button
                  onClick={() => toggle(c._id)}
                  className="shrink-0 w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {isOpen && c.students?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Enrolled Students ({c.students.length})</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                    {c.students.map((s, si) => (
                      <div key={s._id} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <Avatar name={s.name} index={si} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-slate-700 truncate">{s.name}</p>
                          <p className="text-[10px] text-slate-400">{s.studentId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isOpen && (!c.students || c.students.length === 0) && (
                <div className="mt-4 pt-4 border-t border-slate-100 text-center py-4">
                  <p className="text-sm text-slate-400">No students enrolled yet</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
