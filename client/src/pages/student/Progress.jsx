import { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, Award, BarChart3, Target, GraduationCap } from 'lucide-react';
import { Badge, PageHeader } from '../../components/UI';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const GRADE_POINTS = { 'A+': 4.0, 'A': 4.0, 'B+': 3.7, 'B': 3.3, 'C+': 3.0, 'C': 2.7, 'D': 2.0, 'F': 0.0 };
const GRADE_COLOR  = { 'A+': 'green', 'A': 'green', 'B+': 'blue', 'B': 'blue', 'C+': 'yellow', 'C': 'yellow', 'D': 'yellow', 'F': 'red' };

function GpaBar({ gpa }) {
  const pct = (gpa / 4.0) * 100;
  const color = gpa >= 3.5 ? '#059669' : gpa >= 3.0 ? '#1E3535' : gpa >= 2.5 ? '#b87a00' : '#8B3030';
  return (
    <div className="w-full">
      <div className="flex justify-between text-[11px] mb-1.5">
        <span style={{ color }}>GPA: {gpa.toFixed(2)}</span>
        <span style={{ color: '#94a3b8' }}>Max: 4.00</span>
      </div>
      <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: '#e2e8f0' }}>
        <div className="h-2.5 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
    </div>
  );
}

function ProgressRing({ pct, color, size = 80, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[13px] font-bold" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

export default function StudentProgress() {
  const [results, setResults]   = useState([]);
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const { user } = useAuth();
  const { dark } = useTheme();

  useEffect(() => {
    Promise.all([
      api.get('/student/results'),
      api.get('/student/courses'),
    ]).then(([r1, r2]) => {
      setResults(r1.data);
      setCourses(r2.data);
    }).catch(() => toast.error('Failed to load progress data'))
      .finally(() => setLoading(false));
  }, []);

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#e8edf3';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';
  const rowBg   = dark ? '#1a2828' : '#f8fafc';

  // Compute per-semester stats
  const bySemester = results.reduce((acc, r) => {
    const key = r.semester;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const semStats = Object.entries(bySemester).sort(([a], [b]) => +a - +b).map(([sem, items]) => {
    const graded = items.filter(r => r.grade && GRADE_POINTS[r.grade] !== undefined);
    const totalCredits = graded.reduce((s, r) => s + (r.course?.credits || 3), 0);
    const weightedPoints = graded.reduce((s, r) => s + (GRADE_POINTS[r.grade] || 0) * (r.course?.credits || 3), 0);
    const gpa = totalCredits > 0 ? weightedPoints / totalCredits : 0;
    const passed = items.filter(r => r.grade !== 'F').length;
    const avgTotal = items.length ? (items.reduce((s, r) => s + (r.totalMarks || 0), 0) / items.length) : 0;
    return { sem: +sem, items, gpa, passed, total: items.length, avgTotal, totalCredits };
  });

  // CGPA
  const allGraded = results.filter(r => r.grade && GRADE_POINTS[r.grade] !== undefined);
  const totalCredits = allGraded.reduce((s, r) => s + (r.course?.credits || 3), 0);
  const totalPoints  = allGraded.reduce((s, r) => s + (GRADE_POINTS[r.grade] || 0) * (r.course?.credits || 3), 0);
  const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

  const totalPassed  = results.filter(r => r.grade !== 'F').length;
  const passRate     = results.length > 0 ? Math.round((totalPassed / results.length) * 100) : 0;
  const enrolledSems = Object.keys(bySemester).length;

  const TOTAL_SEMESTERS = 8;
  const progressPct = Math.round(((user?.semester || 1) / TOTAL_SEMESTERS) * 100);

  if (loading) return (
    <div className="space-y-5">
      <PageHeader title="Academic Progress" subtitle="Track your GPA, credits, and overall academic journey." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl" style={{ background: dark ? '#1e2e2e' : '#f1f5f9' }} />)}
      </div>
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl" style={{ background: dark ? '#1e2e2e' : '#f1f5f9' }} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Academic Progress" subtitle="Track your GPA, credits earned, and overall academic journey." />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Award,        label: 'CGPA',            value: cgpa.toFixed(2),        sub: 'out of 4.00',              color: '#8B3030' },
          { icon: BookOpen,     label: 'Credits Earned',  value: totalCredits,           sub: 'total credit hours',       color: '#1E3535' },
          { icon: TrendingUp,   label: 'Pass Rate',       value: `${passRate}%`,         sub: `${totalPassed}/${results.length} subjects`, color: '#b87a00' },
          { icon: GraduationCap, label: 'Current Semester', value: user?.semester ? `Sem ${user.semester}` : 'N/A', sub: `of ${TOTAL_SEMESTERS} semesters`, color: '#4338ca' },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="rounded-2xl p-4 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-[11px] font-semibold mt-0.5" style={{ color: headClr }}>{label}</p>
            <p className="text-[10px] mt-0.5" style={{ color: subClr }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Program Progress */}
      <div className="rounded-2xl p-5 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: headClr }}>Program Progress</h2>
            <p className="text-[12px] mt-0.5" style={{ color: subClr }}>
              Semester {user?.semester || 1} of {TOTAL_SEMESTERS} · {user?.section ? `Section ${user.section}` : ''}
            </p>
          </div>
          <Badge color="indigo">Sem {user?.semester || 1}</Badge>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <ProgressRing pct={progressPct} color="#8B3030" size={80} />
          <div className="flex-1">
            <div className="flex gap-2 mb-3 flex-wrap">
              {[...Array(TOTAL_SEMESTERS)].map((_, i) => {
                const sem = i + 1;
                const done = sem < (user?.semester || 1);
                const current = sem === (user?.semester || 1);
                return (
                  <div key={sem} className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                      style={current
                        ? { background: '#8B3030', color: '#fff', boxShadow: '0 0 0 3px #8B303040' }
                        : done
                          ? { background: '#1E3535', color: '#fff' }
                          : { background: dark ? '#1e2e2e' : '#f1f5f9', color: subClr }
                      }>
                      {sem}
                    </div>
                    <span className="text-[9px]" style={{ color: current ? '#8B3030' : subClr }}>
                      {current ? 'Now' : done ? '✓' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <GpaBar gpa={cgpa} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Semester-wise GPA Trend */}
        <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: border }}>
            <div className="flex items-center gap-2">
              <BarChart3 size={15} style={{ color: '#8B3030' }} />
              <h2 className="text-[14px] font-bold" style={{ color: headClr }}>GPA by Semester</h2>
            </div>
          </div>
          {semStats.length === 0 ? (
            <div className="py-12 text-center">
              <BarChart3 size={32} className="mx-auto mb-3 opacity-20" style={{ color: headClr }} />
              <p className="text-[13px]" style={{ color: subClr }}>No results available yet</p>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {semStats.map(({ sem, gpa, passed, total, avgTotal, totalCredits: tc }) => {
                const pct = (gpa / 4.0) * 100;
                const clr = gpa >= 3.5 ? '#059669' : gpa >= 3.0 ? '#1E3535' : gpa >= 2.5 ? '#b87a00' : '#8B3030';
                return (
                  <div key={sem}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold" style={{ color: headClr }}>Semester {sem}</span>
                        <Badge color="slate">{total} subjects</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[12px]">
                        <span style={{ color: clr }}>GPA {gpa.toFixed(2)}</span>
                        <span style={{ color: subClr }}>Avg {avgTotal.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: dark ? '#1e2e2e' : '#f1f5f9' }}>
                      <div className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(pct, 100)}%`, background: clr }} />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: subClr }}>
                      {passed}/{total} passed · {tc} credits
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Enrolled Courses This Semester */}
        <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={15} style={{ color: '#1E3535' }} />
                <h2 className="text-[14px] font-bold" style={{ color: headClr }}>Current Courses</h2>
              </div>
              <Badge color="teal">{courses.length} courses</Badge>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: border }}>
            {courses.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen size={32} className="mx-auto mb-3 opacity-20" style={{ color: headClr }} />
                <p className="text-[13px]" style={{ color: subClr }}>No courses enrolled</p>
              </div>
            ) : courses.map((c, i) => {
              const courseResults = results.filter(r => r.course?._id === c._id || r.course === c._id);
              const latest = courseResults[courseResults.length - 1];
              const colors = ['#8B3030','#1E3535','#b87a00','#2a6648','#4338ca','#0369a1'];
              return (
                <div key={c._id} className="flex items-center gap-4 px-5 py-3.5"
                  style={{ background: i % 2 === 0 ? (dark ? '#0f1e1e' : '#fafafa') : cardBg }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                    style={{ background: colors[i % colors.length] }}>
                    {c.code?.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: headClr }}>{c.name}</p>
                    <p className="text-[11px]" style={{ color: subClr }}>{c.code} · {c.credits || 3} credits</p>
                  </div>
                  {latest?.grade ? (
                    <Badge color={GRADE_COLOR[latest.grade] || 'slate'}>{latest.grade}</Badge>
                  ) : (
                    <span className="text-[11px]" style={{ color: dark ? '#484f58' : '#cbd5e1' }}>No grade</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Semester Breakdown */}
      {semStats.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: subClr }}>Detailed Results</h3>
          {semStats.map(({ sem, items }) => (
            <div key={sem} className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
              <div className="px-5 py-3.5 border-b flex items-center justify-between"
                style={{ borderColor: border, background: dark ? '#1a2828' : '#f8fafc' }}>
                <h3 className="font-bold text-[14px]" style={{ color: headClr }}>Semester {sem}</h3>
                <Badge color={sem === (user?.semester || 1) ? 'red' : 'slate'}>
                  {sem === (user?.semester || 1) ? 'Current' : 'Completed'}
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: dark ? '#0f1e1e' : '#f1f5f9', borderBottom: `1px solid ${border}` }}>
                      {['Course', 'Code', 'Internal', 'External', 'Total', 'Grade'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest"
                          style={{ color: subClr }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r, ri) => (
                      <tr key={r._id} className="border-b last:border-0"
                        style={{ borderColor: dark ? '#0f1e1e' : '#f8fafc', background: ri % 2 === 0 ? (dark ? '#0f1e1e' : '#fafafa') : cardBg }}>
                        <td className="px-4 py-3 font-semibold text-[13px]" style={{ color: headClr }}>{r.course?.name}</td>
                        <td className="px-4 py-3"><Badge color="slate">{r.course?.code}</Badge></td>
                        <td className="px-4 py-3 text-[13px]" style={{ color: headClr }}>{r.internalMarks ?? '—'}</td>
                        <td className="px-4 py-3 text-[13px]" style={{ color: headClr }}>{r.externalMarks ?? '—'}</td>
                        <td className="px-4 py-3 text-[14px] font-bold" style={{ color: headClr }}>{r.totalMarks ?? '—'}</td>
                        <td className="px-4 py-3">
                          {r.grade ? <Badge color={GRADE_COLOR[r.grade] || 'slate'}>{r.grade}</Badge> : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
