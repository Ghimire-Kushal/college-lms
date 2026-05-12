import { useState, useEffect } from 'react';
import { Filter, UserCheck } from 'lucide-react';
import { PrimaryBtn, FormField, Badge, PageHeader, inputCls, selectCls } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const statusMap = {
  present: { label: 'Present', color: 'green' },
  absent:  { label: 'Absent',  color: 'red' },
  late:    { label: 'Late',    color: 'yellow' },
};

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter]   = useState({ courseId: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/admin/courses').then(r => setCourses(r.data)); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/attendance', { params: filter });
      setRecords(r.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const f = (k) => (e) => setFilter(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-5">
      <PageHeader title="Attendance Reports" subtitle="View and filter student attendance records." />
      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={15} className="text-slate-400" />
          <h3 className="font-semibold text-slate-700 text-[14px]">Filter Records</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <FormField label="Course">
            <select value={filter.courseId} onChange={f('courseId')} className={selectCls}>
              <option value="">All Courses</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Start Date">
            <input type="date" value={filter.startDate} onChange={f('startDate')} className={inputCls} />
          </FormField>
          <FormField label="End Date">
            <input type="date" value={filter.endDate} onChange={f('endDate')} className={inputCls} />
          </FormField>
          <PrimaryBtn onClick={load} className="self-end">Apply Filter</PrimaryBtn>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse bg-slate-100 rounded-2xl" />)}
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <UserCheck size={36} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">No attendance records found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting the filters above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(r => {
            const presentCount = r.records?.filter(x => x.status === 'present').length || 0;
            const total = r.records?.length || 0;
            const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;
            return (
              <div key={r._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-[14px]">{r.course?.name}</span>
                    <Badge color="indigo">{r.course?.code}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-slate-500">
                    <span>{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span>By <span className="font-medium text-slate-700">{r.takenBy?.name}</span></span>
                    <Badge color={pct >= 75 ? 'green' : 'red'}>{pct}% present</Badge>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Student</th>
                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">ID</th>
                        <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.records?.map(rec => (
                        <tr key={rec._id} className="border-b border-slate-50 hover:bg-slate-50/40 last:border-0">
                          <td className="px-4 py-2.5 font-medium text-slate-700 text-[13px]">{rec.student?.name}</td>
                          <td className="px-4 py-2.5 text-slate-400 text-[12px]">{rec.student?.studentId}</td>
                          <td className="px-4 py-2.5">
                            <Badge color={statusMap[rec.status]?.color || 'slate'}>
                              {statusMap[rec.status]?.label || rec.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
