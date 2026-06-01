import { useState, useEffect } from 'react';
import { MessageSquare, Clock, Eye, CheckCircle, Trash2 } from 'lucide-react';
import { SearchBar, PageHeader } from '../../components/UI';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'academic',       label: 'Academic',        emoji: '📚' },
  { value: 'faculty',        label: 'Faculty',         emoji: '👨‍🏫' },
  { value: 'infrastructure', label: 'Infrastructure',  emoji: '🏛️' },
  { value: 'library',        label: 'Library',         emoji: '📖' },
  { value: 'general',        label: 'General',         emoji: '💬' },
  { value: 'other',          label: 'Other',           emoji: '📝' },
];

const STATUS_CONFIG = {
  pending:  { color: '#ca8a04', bg: '#fefce8', darkBg: '#422006', label: 'Pending',  icon: Clock,        next: 'reviewed' },
  reviewed: { color: '#2563eb', bg: '#eff6ff', darkBg: '#1e3a5f', label: 'Reviewed', icon: Eye,          next: 'resolved' },
  resolved: { color: '#16a34a', bg: '#f0fdf4', darkBg: '#052e16', label: 'Resolved', icon: CheckCircle,  next: null },
};

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [catFilter, setCat]       = useState('all');
  const [expanded, setExpanded]   = useState(null);
  const { dark } = useTheme();

  const cardBg  = dark ? '#1e293b' : '#ffffff';
  const border  = dark ? '#334155' : '#e5e7eb';
  const headClr = dark ? '#f1f5f9' : '#111827';
  const subClr  = dark ? '#94a3b8' : '#6b7280';

  const load = () => {
    setLoading(true);
    api.get('/admin/feedback')
      .then(r => setFeedbacks(r.data))
      .catch(() => toast.error('Failed to load feedback'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      const r = await api.patch(`/admin/feedback/${id}`, { status });
      setFeedbacks(prev => prev.map(f => f._id === id ? r.data : f));
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteFeedback = async (id) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await api.delete(`/admin/feedback/${id}`);
      setFeedbacks(prev => prev.filter(f => f._id !== id));
      toast.success('Feedback deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = feedbacks.filter(fb => {
    if (statusFilter !== 'all' && fb.status !== statusFilter) return false;
    if (catFilter !== 'all' && fb.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        fb.subject.toLowerCase().includes(q) ||
        fb.message.toLowerCase().includes(q) ||
        fb.student?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all:      feedbacks.length,
    pending:  feedbacks.filter(f => f.status === 'pending').length,
    reviewed: feedbacks.filter(f => f.status === 'reviewed').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Feedback" subtitle="Review and respond to feedback submitted by students." />
      {/* Header stats */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: 'all',      label: 'Total',    value: counts.all,      color: headClr },
          { key: 'pending',  label: 'Pending',  value: counts.pending,  color: '#ca8a04' },
          { key: 'reviewed', label: 'Reviewed', value: counts.reviewed, color: '#2563eb' },
          { key: 'resolved', label: 'Resolved', value: counts.resolved, color: '#16a34a' },
        ].map(({ key, label, value, color }) => (
          <button key={key} onClick={() => setStatus(key)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors"
            style={{
              background: statusFilter === key ? (dark ? '#0f172a' : '#f3f4f6') : (dark ? '#1e293b' : '#ffffff'),
              borderColor: statusFilter === key ? (dark ? '#334155' : '#111827') : border,
              boxShadow: statusFilter === key ? 'inset 0 0 0 1px ' + (dark ? '#334155' : '#111827') : 'none',
            }}>
            <span className="text-[18px] font-bold leading-none" style={{ color }}>{value}</span>
            <span className="text-[11px] font-medium" style={{ color: subClr }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Category filter */}
        <div className="flex gap-1 p-1 rounded-xl flex-shrink-0 flex-wrap"
          style={{ background: dark ? '#0f172a' : '#f3f4f6', border: `1px solid ${border}` }}>
          <button onClick={() => setCat('all')}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
            style={catFilter === 'all'
              ? { background: '#111827', color: '#fff' }
              : { color: subClr }}>
            All
          </button>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCat(c.value)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1"
              style={catFilter === c.value
                ? { background: '#111827', color: '#fff' }
                : { color: subClr }}>
              <span>{c.emoji}</span>{c.label}
            </button>
          ))}
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Search by subject, message, or student..." />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl" style={{ background: dark ? '#334155' : '#f1f5f9' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-14 text-center border shadow-sm" style={{ background: cardBg, borderColor: border }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: dark ? '#0f172a' : '#f0f7f5' }}>
            <MessageSquare size={28} style={{ color: dark ? '#374151' : '#a8cfc8' }} />
          </div>
          <p className="font-semibold text-[15px]" style={{ color: headClr }}>No feedback found</p>
          <p className="text-sm mt-1" style={{ color: subClr }}>
            {search || statusFilter !== 'all' || catFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'No student feedback has been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(fb => {
            const sc   = STATUS_CONFIG[fb.status] || STATUS_CONFIG.pending;
            const cat  = CATEGORIES.find(c => c.value === fb.category);
            const Icon = sc.icon;
            const open = expanded === fb._id;

            return (
              <div key={fb._id} className="rounded-2xl border shadow-sm transition-all"
                style={{ background: cardBg, borderColor: border }}>
                {/* Status strip */}
                <div className="h-1 rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, ${sc.color}, ${sc.color}66)` }} />

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Category emoji */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                      style={{ background: dark ? '#0f172a' : '#f9fafb' }}>
                      {cat?.emoji || '💬'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="text-[14px] font-bold truncate" style={{ color: headClr }}>{fb.subject}</p>
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                              style={{ background: dark ? sc.darkBg : sc.bg, color: sc.color }}>
                              <Icon size={9} />{sc.label}
                            </span>
                          </div>
                          <p className="text-[12px]" style={{ color: subClr }}>
                            {fb.student?.name}
                            {fb.student?.studentId && <span className="ml-1 opacity-60">· {fb.student.studentId}</span>}
                            {fb.student?.semester && <span className="ml-1 opacity-60">· Sem {fb.student.semester}</span>}
                            {fb.student?.section && <span className="opacity-60">/{fb.student.section}</span>}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {sc.next && (
                            <button
                              onClick={() => updateStatus(fb._id, sc.next)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all"
                              style={{
                                background: dark ? STATUS_CONFIG[sc.next].darkBg : STATUS_CONFIG[sc.next].bg,
                                color: STATUS_CONFIG[sc.next].color,
                                borderColor: STATUS_CONFIG[sc.next].color + '44',
                              }}>
                              {(() => { const N = STATUS_CONFIG[sc.next].icon; return <N size={11} />; })()}
                              Mark {STATUS_CONFIG[sc.next].label}
                            </button>
                          )}
                          <button
                            onClick={() => deleteFeedback(fb._id)}
                            className="p-2 rounded-xl transition-colors"
                            style={{ color: subClr }}
                            onMouseEnter={e => { e.currentTarget.style.background = dark ? '#450a0a' : '#fef2f2'; e.currentTarget.style.color = '#111827'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = subClr; }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Message preview / expand */}
                      <div className="mt-2">
                        <p className="text-[12px] leading-relaxed" style={{ color: subClr }}>
                          {open ? fb.message : (fb.message.length > 180 ? `${fb.message.slice(0, 180)}…` : fb.message)}
                        </p>
                        {fb.message.length > 180 && (
                          <button onClick={() => setExpanded(open ? null : fb._id)}
                            className="text-[11px] font-semibold mt-1 transition-colors"
                            style={{ color: '#111827' }}>
                            {open ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-[10px]" style={{ color: dark ? '#484f58' : '#cbd5e1' }}>
                        <span className="px-2 py-0.5 rounded-full capitalize"
                          style={{ background: dark ? '#334155' : '#f1f5f9', color: subClr }}>
                          {cat?.label || fb.category}
                        </span>
                        <span>{new Date(fb.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
