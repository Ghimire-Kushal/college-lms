import { useState, useEffect } from 'react';
import { Trash2, ClipboardList, BookOpen, Calendar, Hash, Clock, CheckCircle } from 'lucide-react';
import { PageHeader, Card } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);

  const load = () => api.get('/admin/assignments').then(r => setAssignments(r.data));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment and all its submissions?')) return;
    try {
      await api.delete(`/admin/assignments/${id}`);
      toast.success('Assignment deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const isPast = (d) => new Date(d) < new Date();
  const active = assignments.filter(a => !isPast(a.dueDate));
  const closed = assignments.filter(a =>  isPast(a.dueDate));

  return (
    <div className="space-y-5">
      <PageHeader title="Assignments" subtitle={`${assignments.length} total · ${active.length} active · ${closed.length} closed`} />

      {assignments.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <ClipboardList size={40} className="mb-3" />
            <p className="text-slate-500 font-medium">No assignments yet</p>
            <p className="text-sm text-slate-400 mt-1">Assignments created by teachers will appear here.</p>
          </div>
        </Card>
      )}

      {active.length > 0 && (
        <section>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active ({active.length})
          </p>
          <div className="space-y-3">
            {active.map(a => <AssignmentRow key={a._id} a={a} onDelete={handleDelete} />)}
          </div>
        </section>
      )}

      {closed.length > 0 && (
        <section>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" /> Closed ({closed.length})
          </p>
          <div className="space-y-3">
            {closed.map(a => <AssignmentRow key={a._id} a={a} onDelete={handleDelete} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function AssignmentRow({ a, onDelete }) {
  const past = new Date(a.dueDate) < new Date();
  const due  = new Date(a.dueDate);

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden hover:border-[#d1d5db] transition-colors group">
      <div className="h-1" style={{ background: past ? '#9ca3af' : '#111827' }} />
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: past ? '#f5f5f5' : '#fef0f0' }}>
          {past
            ? <Clock size={16} className="text-slate-400" />
            : <CheckCircle size={16} className="text-[#111827]" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-[14px] text-[#111827]">{a.title}</h3>
            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
              style={past
                ? { background: '#f0f0f0', color: '#6b7280' }
                : { background: '#fef0f0', color: '#111827' }}>
              {past ? 'Closed' : 'Active'}
            </span>
          </div>
          {a.description && (
            <p className="text-[11px] text-[#6b7280] mb-1.5 line-clamp-1">{a.description}</p>
          )}
          <div className="flex flex-wrap gap-2 text-[11px]">
            {a.course && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#edf7f5] text-[#111827]">
                <BookOpen size={9} /> {a.course.name}
              </span>
            )}
            {a.teacher && (
              <span className="flex items-center gap-1 text-[#6b7280]">
                {a.teacher.name}
              </span>
            )}
            <span className="flex items-center gap-1 text-[#6b7280]">
              <Calendar size={9} /> {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1 text-[#6b7280]">
              <Hash size={9} /> {a.totalMarks} marks
            </span>
          </div>
        </div>

        <button
          onClick={() => onDelete(a._id)}
          className="p-1.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 text-slate-400 hover:bg-red-50 hover:text-red-500"
          title="Delete assignment">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
