import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function StudentAttendance() {
  const [summary, setSummary] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/attendance')
      .then(r => setSummary(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  const pctColor = (p) => parseFloat(p) >= 75 ? 'text-green-600' : parseFloat(p) >= 60 ? 'text-yellow-600' : 'text-red-600';
  const barColor = (p) => parseFloat(p) >= 75 ? 'bg-green-500' : parseFloat(p) >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  const statusColor = { present: 'bg-green-100 text-green-700', absent: 'bg-red-100 text-red-700', late: 'bg-yellow-100 text-yellow-700' };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summary.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">No attendance data yet</div>}
        {summary.map((item, i) => (
          <div key={i} className={`bg-white rounded-xl p-5 shadow-sm border cursor-pointer transition-colors ${selected === i ? 'border-indigo-300' : 'border-gray-100 hover:border-indigo-200'}`}
            onClick={() => setSelected(selected === i ? null : i)}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">{item.course?.name}</h3>
              <span className={`text-xl font-bold ${pctColor(item.percentage)}`}>{item.percentage}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div className={`h-2 rounded-full ${barColor(item.percentage)}`} style={{ width: `${Math.min(item.percentage, 100)}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="text-green-600">{item.present} present</span>
              <span className="text-red-500">{item.absent} absent</span>
              <span className="text-yellow-600">{item.late} late</span>
              <span>{item.total} total</span>
            </div>
            {parseFloat(item.percentage) < 75 && (
              <div className="mt-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">⚠ Below 75% – attendance is low</div>
            )}

            {selected === i && item.records?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-600 mb-2">Attendance History</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {item.records.map((r, j) => (
                    <div key={j} className="flex items-center justify-between py-1">
                      <span className="text-xs text-gray-600">{new Date(r.date).toLocaleDateString()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor[r.status]}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
