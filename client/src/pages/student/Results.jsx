import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/results')
      .then(r => setResults(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  const bySemester = results.reduce((acc, r) => {
    const key = r.semester;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const gradeColor = { 'A+': 'text-green-700 bg-green-50', A: 'text-green-700 bg-green-50', 'B+': 'text-blue-700 bg-blue-50', B: 'text-blue-700 bg-blue-50', 'C+': 'text-yellow-700 bg-yellow-50', C: 'text-yellow-700 bg-yellow-50', D: 'text-orange-700 bg-orange-50', F: 'text-red-700 bg-red-50' };

  if (results.length === 0) return (
    <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
      No results published yet
    </div>
  );

  return (
    <div className="space-y-6">
      {Object.entries(bySemester).sort(([a], [b]) => a - b).map(([sem, items]) => {
        const avg = items.length ? (items.reduce((s, r) => s + (r.totalMarks || 0), 0) / items.length).toFixed(1) : 0;
        return (
          <div key={sem} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
              <h2 className="font-semibold text-indigo-700">Semester {sem}</h2>
              <span className="text-sm text-indigo-600">Average: <strong>{avg}</strong></span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-50">
                  <tr>
                    {['Course', 'Code', 'Internal', 'External', 'Total', 'Grade', 'Remarks'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{r.course?.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{r.course?.code}</td>
                      <td className="px-4 py-3 text-gray-600">{r.internalMarks}</td>
                      <td className="px-4 py-3 text-gray-600">{r.externalMarks}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{r.totalMarks}</td>
                      <td className="px-4 py-3">
                        {r.grade && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${gradeColor[r.grade] || 'bg-gray-100 text-gray-600'}`}>{r.grade}</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{r.remarks || '—'}</td>
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
