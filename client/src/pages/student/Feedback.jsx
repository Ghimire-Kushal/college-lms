import { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle, Clock, Eye } from 'lucide-react';
import { PageHeader, PrimaryBtn, FormField } from '../../components/UI';
import { useTheme } from '../../context/ThemeContext';
import { useInputStyle } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'academic', label: 'Academic', emoji: '📚' },
  { value: 'faculty', label: 'Faculty', emoji: '👨‍🏫' },
  { value: 'infrastructure', label: 'Infrastructure', emoji: '🏛️' },
  { value: 'library', label: 'Library', emoji: '📖' },
  { value: 'general', label: 'General', emoji: '💬' },
  { value: 'other', label: 'Other', emoji: '📝' },
];

const STATUS_CONFIG = {
  pending:  { color: '#b87a00', bg: 'bg-amber-50',  darkBg: '#2d2712', label: 'Pending',  icon: Clock },
  reviewed: { color: '#1E3535', bg: 'bg-teal-50',   darkBg: '#0d1a1a', label: 'Reviewed', icon: Eye },
  resolved: { color: '#059669', bg: 'bg-emerald-50', darkBg: '#1a2e22', label: 'Resolved', icon: CheckCircle },
};

const emptyForm = { category: 'general', subject: '', message: '' };

export default function StudentFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm]           = useState(emptyForm);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { dark } = useTheme();
  const inputStyle = useInputStyle();

  const load = () =>
    api.get('/student/feedback')
      .then(r => setFeedbacks(r.data))
      .catch(() => toast.error('Failed to load feedback history'))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/student/feedback', form);
      toast.success('Feedback submitted successfully!');
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#e8edf3';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';

  return (
    <div className="space-y-5">
      <PageHeader title="Feedback" subtitle="Share your thoughts, suggestions, or concerns with the college administration." />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Submission Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border shadow-sm overflow-hidden sticky top-4" style={{ background: cardBg, borderColor: border }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: border }}>
              <div className="flex items-center gap-2">
                <MessageSquare size={16} style={{ color: '#8B3030' }} />
                <h2 className="text-[14px] font-bold" style={{ color: headClr }}>Submit Feedback</h2>
              </div>
              <p className="text-[12px] mt-1" style={{ color: subClr }}>
                Your feedback is anonymous to teachers but visible to admin.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <FormField label="Category">
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, category: cat.value }))}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[11px] font-semibold transition-all"
                      style={form.category === cat.value
                        ? { background: 'linear-gradient(135deg, #8B3030, #6b2525)', borderColor: '#8B3030', color: '#fff' }
                        : { background: dark ? '#1a2828' : '#f8fafc', borderColor: border, color: subClr }
                      }
                    >
                      <span className="text-base">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="Subject">
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Brief subject of your feedback"
                  maxLength={120}
                  required
                  className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:ring-2 border transition-shadow"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Message">
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Describe your feedback, suggestion, or concern in detail…"
                  maxLength={1000}
                  required
                  className="w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:ring-2 border transition-shadow resize-none"
                  style={inputStyle}
                />
                <p className="text-[10px] mt-1 text-right" style={{ color: subClr }}>{form.message.length}/1000</p>
              </FormField>

              <PrimaryBtn type="submit" disabled={submitting} className="w-full justify-center">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </span>
                ) : (
                  <><Send size={14} /> Submit Feedback</>
                )}
              </PrimaryBtn>
            </form>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: border }}>
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-bold" style={{ color: headClr }}>My Submissions</h2>
                <span className="text-[12px]" style={{ color: subClr }}>{feedbacks.length} total</span>
              </div>
            </div>

            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl" style={{ background: dark ? '#1e2e2e' : '#f1f5f9' }} />
                ))}
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="py-16 text-center">
                <MessageSquare size={36} className="mx-auto mb-3 opacity-20" style={{ color: headClr }} />
                <p className="text-[14px] font-medium" style={{ color: subClr }}>No feedback submitted yet</p>
                <p className="text-[12px] mt-1" style={{ color: dark ? '#484f58' : '#cbd5e1' }}>
                  Your submissions will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: border }}>
                {feedbacks.map((fb, i) => {
                  const sc = STATUS_CONFIG[fb.status] || STATUS_CONFIG.pending;
                  const StatusIcon = sc.icon;
                  const cat = CATEGORIES.find(c => c.value === fb.category);
                  return (
                    <div key={fb._id} className="px-5 py-4 hover:opacity-90 transition-opacity"
                      style={{ background: i % 2 === 0 ? (dark ? '#0f1e1e' : '#fafafa') : cardBg }}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{cat?.emoji || '💬'}</span>
                          <p className="text-[13px] font-bold truncate" style={{ color: headClr }}>{fb.subject}</p>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                          style={{
                            background: dark ? sc.darkBg : sc.bg.replace('bg-', ''),
                            color: sc.color,
                          }}>
                          <StatusIcon size={10} />
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-[12px] leading-relaxed mb-2" style={{ color: subClr }}>
                        {fb.message.length > 160 ? `${fb.message.slice(0, 160)}…` : fb.message}
                      </p>
                      <div className="flex items-center gap-3 text-[10px]" style={{ color: dark ? '#484f58' : '#cbd5e1' }}>
                        <span className="capitalize px-2 py-0.5 rounded-full" style={{ background: dark ? '#1e2e2e' : '#f1f5f9', color: subClr }}>
                          {cat?.label || fb.category}
                        </span>
                        <span>{new Date(fb.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
