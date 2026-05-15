import { useState, useEffect } from 'react';
import { MessageSquare, Clock, Eye, CheckCircle, Trash2, Search, Filter } from 'lucide-react';
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
  pending:  { color: '#b87a00', bg: '#fef9ec', darkBg: '#2d2712', label: 'Pending',  icon: Clock,        next: 'reviewed' },
  reviewed: { color: '#1E3535', bg: '#edf7f5', darkBg: '#0d1a1a', label: 'Reviewed', icon: Eye,          next: 'resolved' },
  resolved: { color: '#059669', bg: '#ecfdf5', darkBg: '#0d2018', label: 'Resolved', icon: CheckCircle,  next: null },
};

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [catFilter, setCat]       = useState('all');
  const [expanded, setExpanded]   = useState(null);
  const { dark } = useTheme();

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#e8edf3';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';

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
      {/* Header */}
      <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1414 0%, #0f1e1e 55%, #162828 100%)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F2C04E 0%, transparent 70%)', opacity: 0.18 }} />
        <p className="text-[#F2C04E] text-xs font-semibold uppercase tracking-wider">Inbox</p>
        <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Student Feedback</h2>
        <p className="text-white/50 text-sm mt-1">Review and respond to feedback submitted by students.</p>

        <div className="flex gap-3 mt-5 flex-wrap">
          {[
            { key: 'all',      label: 'Total',    value: counts.all },
            { key: 'pending',  label: 'Pending',  value: counts.pending },
            { key: 'reviewed', label: 'Reviewed', value: counts.reviewed },
            { key: 'resolved', label: 'Resolved', value: counts.resolved },
          ].map(({ key, label, value }) => (
            <button key={key} onClick={() => setStatus(key)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
              style={{
                background: statusFilter === key ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
                outline: statusFilter === key ? '2px solid rgba(255,255,255,0.3)' : 'none',
              }}>
              <span className="text-lg font-bold text-white">{value}</span>
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Category filter */}
        <div className="flex gap-1 p-1 rounded-xl flex-shrink-0 flex-wrap"
          style={{ background: dark ? '#131e1e' : '#f0ebe8', border: `1px solid ${border}` }}>
          <button onClick={() => setCat('all')}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
            style={catFilter === 'all'
              ? { background: '#8B3030', color: '#fff' }
              : { color: subClr }}>
            All
          </button>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCat(c.value)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1"
              style={catFilter === c.value
                ? { background: '#8B3030', color: '#fff' }
                : { color: subClr }}>
              <span>{c.emoji}</span>{c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: subClr }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by subject, message, or student name..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] border outline-none"
            style={{ background: cardBg, borderColor: border, color: headClr }}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl" style={{ background: dark ? '#1e2e2e' : '#f1f5f9' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-14 text-center border shadow-sm" style={{ background: cardBg, borderColor: border }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: dark ? '#0f1e1e' : '#f0f7f5' }}>
            <MessageSquare size={28} style={{ color: dark ? '#2a4a4a' : '#a8cfc8' }} />
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
                      style={{ background: dark ? '#1a2828' : '#f0f7f5' }}>
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
                            onMouseEnter={e => { e.currentTarget.style.background = dark ? '#2a1414' : '#fff0f0'; e.currentTarget.style.color = '#8B3030'; }}
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
                            style={{ color: '#8B3030' }}>
                            {open ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-[10px]" style={{ color: dark ? '#484f58' : '#cbd5e1' }}>
                        <span className="px-2 py-0.5 rounded-full capitalize"
                          style={{ background: dark ? '#1e2e2e' : '#f1f5f9', color: subClr }}>
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
