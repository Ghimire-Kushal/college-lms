import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Badge, PageHeader } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const statusMap = {
  present: { color: 'green', label: 'Present' },
  absent:  { color: 'red',   label: 'Absent' },
  late:    { color: 'yellow', label: 'Late' },
};

function ProgressBar({ pct }) {
  const color = pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div className="h-2 rounded-full progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    </div>
  );
}

export default function StudentAttendance() {
  const [summary, setSummary] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/student/attendance')
      .then(r => setSummary(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-5">
      <PageHeader title="My Attendance" subtitle="Track your class attendance across all courses." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-40 animate-pulse bg-slate-100 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="My Attendance" subtitle="Track your class attendance across all courses." />
      {summary.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm text-slate-400">
          No attendance data yet
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {summary.map((item, i) => {
          const pct = parseFloat(item.percentage) || 0;
          const isLow = pct < 75;
          const isOpen = expanded === i;
          const textColor = pct >= 75 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-rose-600';

          return (
            <div key={i} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isLow ? 'border-rose-200' : 'border-slate-100'}`}>
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpanded(e => e === i ? null : i)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-[14px] truncate">{item.course?.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.course?.code}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xl font-bold ${textColor}`}>{pct}%</span>
                    {isOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                  </div>
                </div>

                <ProgressBar pct={pct} />

                <div className="flex items-center justify-between mt-3 text-[11px]">
                  <span className="text-emerald-600 font-medium">{item.present} present</span>
                  <span className="text-rose-500 font-medium">{item.absent} absent</span>
                  {item.late > 0 && <span className="text-amber-600 font-medium">{item.late} late</span>}
                  <span className="text-slate-400">{item.total} total</span>
                </div>

                {isLow && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-xl text-[11px] text-rose-600 font-medium border border-rose-100">
                    <AlertTriangle size={12} />
                    Below 75% — attendance is low
                  </div>
                )}
              </div>

              {isOpen && item.records?.length > 0 && (
                <div className="border-t border-slate-100 p-4">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">History</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {item.records.map((r, j) => (
                      <div key={j} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                        <span className="text-[12px] text-slate-600">
                          {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <Badge color={statusMap[r.status]?.color || 'slate'}>
                          {statusMap[r.status]?.label || r.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
