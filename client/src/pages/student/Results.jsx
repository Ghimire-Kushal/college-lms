import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { Badge } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const gradeColor = {
  'A+': 'green', 'A': 'green', 'B+': 'blue', 'B': 'blue',
  'C+': 'yellow', 'C': 'yellow', 'D': 'yellow', 'F': 'red',
};

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/results')
      .then(r => setResults(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => <div key={i} className="h-40 animate-pulse bg-slate-100 rounded-2xl" />)}
    </div>
  );

  if (results.length === 0) return (
    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
      <BarChart3 size={36} className="mx-auto text-slate-200 mb-3" />
      <p className="text-slate-500 font-medium">No results published yet</p>
      <p className="text-sm text-slate-400 mt-1">Check back after your exams are graded.</p>
    </div>
  );

  const bySemester = results.reduce((acc, r) => {
    const key = r.semester;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(bySemester).sort(([a], [b]) => a - b).map(([sem, items]) => {
        const avg = items.length
          ? (items.reduce((s, r) => s + (r.totalMarks || 0), 0) / items.length).toFixed(1)
          : 0;
        const passCount = items.filter(r => r.grade !== 'F').length;

        return (
          <div key={sem} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-indigo-700 text-[15px]">Semester {sem}</h2>
                <Badge color="indigo">{items.length} subjects</Badge>
              </div>
              <div className="flex items-center gap-4 text-[12px]">
                <span className="text-slate-600">Avg: <span className="font-bold text-indigo-700">{avg}</span></span>
                <Badge color="green">{passCount}/{items.length} passed</Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    {['Course', 'Code', 'Internal', 'External', 'Total', 'Grade', 'Remarks'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(r => (
                    <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50/40 last:border-0 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-slate-700 text-[13px]">{r.course?.name}</td>
                      <td className="px-4 py-3.5"><Badge color="slate">{r.course?.code}</Badge></td>
                      <td className="px-4 py-3.5 text-[13px] font-medium text-slate-700">{r.internalMarks}</td>
                      <td className="px-4 py-3.5 text-[13px] font-medium text-slate-700">{r.externalMarks}</td>
                      <td className="px-4 py-3.5 text-[15px] font-bold text-slate-800">{r.totalMarks}</td>
                      <td className="px-4 py-3.5">
                        {r.grade ? <Badge color={gradeColor[r.grade] || 'slate'}>{r.grade}</Badge> : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-slate-400">{r.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
