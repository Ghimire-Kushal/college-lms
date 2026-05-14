import { useState, useEffect } from 'react';
import { Video, Link2, Clock, Calendar, ExternalLink, Monitor, BookOpen } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

const platformInfo = {
  meet:  { label: 'Google Meet', color: '#1E8E3E', bg: '#e6f4ea' },
  zoom:  { label: 'Zoom',        color: '#2D8CFF', bg: '#e8f1ff' },
  teams: { label: 'MS Teams',    color: '#464EB8', bg: '#eceeff' },
  other: { label: 'Other',       color: '#8B3030', bg: '#fef0f0' },
};

function CountdownBadge({ scheduledAt }) {
  const diff = new Date(scheduledAt) - new Date();
  if (diff <= 0) return null;
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const text  = days > 0 ? `in ${days}d ${hours}h` : hours > 0 ? `in ${hours}h ${mins}m` : `in ${mins}m`;
  const urgent = diff < 30 * 60 * 1000;
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: urgent ? '#fef0f0' : '#f0fdf4', color: urgent ? '#8B3030' : '#059669' }}>
      {text}
    </span>
  );
}

export default function StudentOnlineClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('upcoming');
  const { dark } = useTheme();

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#ede8e4';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';

  useEffect(() => {
    api.get('/student/online-classes')
      .then(r => setClasses(r.data))
      .catch(() => toast.error('Failed to load classes'))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = classes.filter(c => new Date(c.scheduledAt) >= now);
  const past     = classes.filter(c => new Date(c.scheduledAt) < now);
  const display  = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1c1c 0%, #1a2e2e 55%, #1e3535 100%)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F2C04E 0%, transparent 70%)', opacity: 0.18 }} />
        <p className="text-[#F2C04E] text-xs font-semibold uppercase tracking-wider">Virtual Classroom</p>
        <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Online Classes</h2>
        <p className="text-white/50 text-sm mt-1">Join your scheduled virtual classes here.</p>
        <div className="flex gap-3 mt-5 flex-wrap">
          {[
            { label: 'Upcoming', value: upcoming.length },
            { label: 'Completed', value: past.length },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <span className="text-lg font-bold text-white">{value}</span>
              <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: dark ? '#131e1e' : '#f0ebe8', border: `1px solid ${border}` }}>
        {[
          { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { key: 'past',     label: `Past (${past.length})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
            style={tab === key
              ? { background: '#1E3535', color: '#fff', boxShadow: '0 2px 8px rgba(30,53,53,0.4)' }
              : { color: subClr }}>
            {label}
          </button>
        ))}
      </div>

      {/* Classes grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ background: dark ? '#1a2828' : '#f0ebe8' }} />
          ))}
        </div>
      ) : display.length === 0 ? (
        <div className="rounded-2xl p-14 text-center border shadow-sm" style={{ background: cardBg, borderColor: border }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: dark ? '#0f1e1e' : '#edf7f5' }}>
            <Video size={28} style={{ color: dark ? '#2a4a4a' : '#a8cfc8' }} />
          </div>
          <p className="font-semibold text-[15px]" style={{ color: headClr }}>
            {tab === 'upcoming' ? 'No upcoming classes' : 'No past classes'}
          </p>
          <p className="text-sm mt-1" style={{ color: subClr }}>
            {tab === 'upcoming' ? 'Your teacher will schedule classes here.' : 'Completed classes will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {display.map(cls => {
            const pInfo = platformInfo[cls.platform] || platformInfo.other;
            const isPast = new Date(cls.scheduledAt) < now;
            const scheduled = new Date(cls.scheduledAt);
            return (
              <div key={cls._id} className="rounded-2xl border shadow-sm transition-all hover:shadow-md"
                style={{ background: cardBg, borderColor: border }}>
                <div className="h-1 rounded-t-2xl"
                  style={{ background: isPast ? '#6e7681' : 'linear-gradient(90deg, #1E3535, #2a4a4a)' }} />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: isPast ? (dark ? '#1a1a1a' : '#f0f0f0') : (dark ? '#0f1e1e' : '#edf7f5') }}>
                      <Video size={18} style={{ color: isPast ? subClr : '#1E3535' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-[14px]" style={{ color: headClr }}>{cls.title}</h3>
                        {!isPast && <CountdownBadge scheduledAt={cls.scheduledAt} />}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <BookOpen size={11} style={{ color: subClr }} />
                        <p className="text-[12px]" style={{ color: subClr }}>{cls.course?.name}</p>
                      </div>
                    </div>
                  </div>

                  {cls.description && (
                    <p className="text-[12px] leading-relaxed line-clamp-2 mb-3" style={{ color: subClr }}>{cls.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: dark ? '#1a2020' : pInfo.bg, color: pInfo.color }}>
                      <Monitor size={10} /> {pInfo.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full"
                      style={{ background: dark ? '#1a1a2a' : '#f0f0ff', color: subClr }}>
                      <Clock size={10} /> {cls.duration} min
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: border }}>
                    <div>
                      <div className="flex items-center gap-1.5 text-[12px]" style={{ color: subClr }}>
                        <Calendar size={11} />
                        {scheduled.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' · '}
                        {scheduled.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <p className="text-[11px] mt-0.5" style={{ color: subClr }}>By {cls.teacher?.name}</p>
                    </div>
                    {!isPast ? (
                      <a href={cls.meetLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
                        style={{ background: 'linear-gradient(135deg, #1E3535, #2a4a4a)', color: '#fff' }}>
                        <Link2 size={11} /> Join <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                        style={{ background: dark ? '#1a1a1a' : '#f0f0f0', color: subClr }}>Ended</span>
                    )}
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
