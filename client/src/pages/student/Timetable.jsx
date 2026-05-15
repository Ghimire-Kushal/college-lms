import { useState, useEffect } from 'react';
import { Clock, MapPin, CalendarDays } from 'lucide-react';
import { PageHeader } from '../../components/UI';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DAY_STYLES = [
  { light: { bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca' }, dark: { bg: '#1e2d4f', border: '#2d3d6a', text: '#818cf8' } },
  { light: { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1' }, dark: { bg: '#1a2a3f', border: '#2d3d56', text: '#60a5fa' } },
  { light: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' }, dark: { bg: '#1a2e22', border: '#1e4030', text: '#34d399' } },
  { light: { bg: '#faf5ff', border: '#ddd6fe', text: '#7c3aed' }, dark: { bg: '#221e36', border: '#302857', text: '#a78bfa' } },
  { light: { bg: '#fffbeb', border: '#fde68a', text: '#b45309' }, dark: { bg: '#2d2712', border: '#3d3318', text: '#fbbf24' } },
  { light: { bg: '#fff1f2', border: '#fecdd3', text: '#be123c' }, dark: { bg: '#2d1517', border: '#3d1f22', text: '#f87171' } },
];

const COURSE_COLORS = ['#8B3030', '#1E3535', '#b87a00', '#2a6648', '#4338ca', '#0369a1'];

function TimeSlot({ entry, idx, dark }) {
  const bg   = dark ? '#161b22' : '#ffffff';
  const border = dark ? '#21262d' : '#f1f5f9';
  const color = COURSE_COLORS[idx % COURSE_COLORS.length];

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border transition-all"
      style={{ background: bg, borderColor: border, borderLeft: `3px solid ${color}` }}
    >
      <div className="shrink-0 text-center w-14">
        <p className="text-[12px] font-bold" style={{ color }}>{entry.startTime}</p>
        <p className="text-[10px]" style={{ color: dark ? '#6e7681' : '#94a3b8' }}>{entry.endTime}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate" style={{ color: dark ? '#e2e8f0' : '#1e293b' }}>
          {entry.course?.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11px]" style={{ color: dark ? '#8b949e' : '#64748b' }}>
            {entry.teacher?.name}
          </span>
          {entry.room && (
            <span className="flex items-center gap-0.5 text-[10px]" style={{ color: dark ? '#6e7681' : '#94a3b8' }}>
              <MapPin size={9} />
              Room {entry.room}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentTimetable() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(null);
  const { dark } = useTheme();

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setActiveDay(DAYS.includes(today) ? today : 'Monday');

    api.get('/student/timetable')
      .then(r => setEntries(r.data))
      .catch(() => toast.error('Failed to load timetable'))
      .finally(() => setLoading(false));
  }, []);

  const cardBg   = dark ? '#131e1e' : '#ffffff';
  const border   = dark ? '#1e2e2e' : '#e8edf3';
  const subClr   = dark ? '#6e7681' : '#64748b';
  const headClr  = dark ? '#e2e8f0' : '#1e293b';

  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = entries.filter(e => e.dayOfWeek === d).sort((a, b) => a.startTime?.localeCompare(b.startTime));
    return acc;
  }, {});

  const totalClasses = entries.length;

  if (loading) return (
    <div className="space-y-5">
      <PageHeader title="Class Routine" subtitle="Your weekly class schedule and timetable." />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {DAYS.map(d => <div key={d} className="h-12 animate-pulse rounded-xl" style={{ background: dark ? '#1e2e2e' : '#f1f5f9' }} />)}
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl" style={{ background: dark ? '#1e2e2e' : '#f1f5f9' }} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Class Routine" subtitle="Your weekly class schedule and timetable." />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Classes/Week', value: totalClasses, color: '#8B3030' },
          { label: 'Active Days', value: DAYS.filter(d => byDay[d].length > 0).length, color: '#1E3535' },
          { label: 'Free Days', value: DAYS.filter(d => byDay[d].length === 0).length, color: '#b87a00' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[12px] mt-1" style={{ color: subClr }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 flex-wrap">
        {DAYS.map((d, di) => {
          const ds = DAY_STYLES[di];
          const style = dark ? ds.dark : ds.light;
          const isActive = activeDay === d;
          const count = byDay[d].length;
          return (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className="flex-1 min-w-[80px] px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all border"
              style={isActive
                ? { background: style.bg, borderColor: style.border, color: style.text, boxShadow: `0 2px 8px ${style.border}` }
                : { background: dark ? '#0f1e1e' : '#f8fafc', borderColor: dark ? '#1e2e2e' : '#e8edf3', color: dark ? '#6e7681' : '#94a3b8' }
              }
            >
              <span className="block truncate">{d.slice(0, 3)}</span>
              <span className="block text-[10px] mt-0.5 opacity-70">{count} {count === 1 ? 'class' : 'classes'}</span>
            </button>
          );
        })}
      </div>

      {/* Schedule for selected day */}
      {activeDay && (
        <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
          {(() => {
            const di = DAYS.indexOf(activeDay);
            const ds = DAY_STYLES[di];
            const style = dark ? ds.dark : ds.light;
            return (
              <div className="px-5 py-4 border-b flex items-center justify-between"
                style={{ background: style.bg, borderColor: style.border }}>
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} style={{ color: style.text }} />
                  <h3 className="font-bold text-[15px]" style={{ color: style.text }}>{activeDay}</h3>
                </div>
                <span className="text-[12px] font-medium" style={{ color: style.text, opacity: 0.7 }}>
                  {byDay[activeDay].length} {byDay[activeDay].length === 1 ? 'class' : 'classes'}
                </span>
              </div>
            );
          })()}

          <div className="p-4 space-y-2.5">
            {byDay[activeDay].length === 0 ? (
              <div className="py-12 text-center">
                <Clock size={32} className="mx-auto mb-3 opacity-20" style={{ color: headClr }} />
                <p className="text-[14px] font-medium" style={{ color: subClr }}>No classes on {activeDay}</p>
                <p className="text-[12px] mt-1" style={{ color: dark ? '#484f58' : '#cbd5e1' }}>Enjoy your free day!</p>
              </div>
            ) : byDay[activeDay].map((entry, idx) => (
              <TimeSlot key={entry._id} entry={entry} idx={idx} dark={dark} />
            ))}
          </div>
        </div>
      )}

      {/* Full week overview */}
      <div>
        <h3 className="text-[13px] font-bold uppercase tracking-wider mb-3" style={{ color: subClr }}>Full Week Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {DAYS.map((d, di) => {
            const ds = DAY_STYLES[di];
            const style = dark ? ds.dark : ds.light;
            const classes = byDay[d];
            return (
              <div key={d} className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
                <div className="px-4 py-3 border-b flex items-center justify-between"
                  style={{ background: style.bg, borderColor: style.border }}>
                  <span className="text-[13px] font-bold" style={{ color: style.text }}>{d}</span>
                  <span className="text-[11px]" style={{ color: style.text, opacity: 0.7 }}>{classes.length} {classes.length === 1 ? 'class' : 'classes'}</span>
                </div>
                <div className="p-3 space-y-1.5">
                  {classes.length === 0 ? (
                    <p className="text-[11px] py-2 text-center" style={{ color: dark ? '#484f58' : '#cbd5e1' }}>Free day</p>
                  ) : classes.map((e, idx) => (
                    <div key={e._id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                      style={{ background: dark ? '#1a2828' : '#f8fafc' }}>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: COURSE_COLORS[idx % COURSE_COLORS.length] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold truncate" style={{ color: headClr }}>{e.course?.name}</p>
                        <p className="text-[10px]" style={{ color: subClr }}>{e.startTime}–{e.endTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
