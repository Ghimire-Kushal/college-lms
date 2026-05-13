import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const themes = {
  blue:    { bg: 'from-blue-500 to-blue-600',      icon: { bg: '#dbeafe', text: '#2563eb' } },
  indigo:  { bg: 'from-indigo-500 to-indigo-600',  icon: { bg: '#e0e7ff', text: '#4338ca' } },
  violet:  { bg: 'from-violet-500 to-purple-600',  icon: { bg: '#ede9fe', text: '#6d28d9' } },
  green:   { bg: 'from-emerald-500 to-teal-600',   icon: { bg: '#d1fae5', text: '#059669' } },
  teal:    { bg: 'from-teal-500 to-cyan-600',      icon: { bg: '#ccfbf1', text: '#0d9488' } },
  yellow:  { bg: 'from-amber-400 to-orange-500',   icon: { bg: '#fef3c7', text: '#d97706' } },
  red:     { bg: 'from-rose-500 to-red-600',       icon: { bg: '#ffe4e6', text: '#e11d48' } },
  sky:     { bg: 'from-sky-500 to-blue-600',       icon: { bg: '#e0f2fe', text: '#0284c7' } },
  purple:  { bg: 'from-purple-500 to-fuchsia-600', icon: { bg: '#f3e8ff', text: '#7c3aed' } },
  rose:    { bg: 'from-rose-500 to-pink-600',      icon: { bg: '#ffe4e6', text: '#e11d48' } },
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, trend, gradient = false }) {
  const { dark } = useTheme();
  const t = themes[color] || themes.blue;

  if (gradient) {
    return (
      <div className={`rounded-2xl bg-gradient-to-br ${t.bg} p-5 text-white shadow-lg card-hover`}>
        <div className="flex items-start justify-between">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
            <Icon size={22} className="text-white" />
          </div>
          {trend !== undefined && (
            <span className="flex items-center gap-1 text-[11px] font-semibold bg-white/20 px-2 py-1 rounded-full">
              {trend > 0 ? <TrendingUp size={11} /> : trend < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <div className="mt-5">
          <p className="text-3xl font-extrabold tracking-tight">{value}</p>
          <p className="text-[13px] font-medium mt-1.5 text-white/80">{title}</p>
          {subtitle && <p className="text-[11px] text-white/60 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5 shadow-sm card-hover"
      style={{
        background: dark ? '#161b22' : '#ffffff',
        border: `1px solid ${dark ? '#21262d' : '#e8edf3'}`,
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="rounded-xl p-2.5"
          style={{ background: dark ? t.icon.bg + '22' : t.icon.bg }}
        >
          <Icon size={22} style={{ color: t.icon.text }} />
        </div>
        {trend !== undefined && (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full"
            style={
              trend >= 0
                ? { background: dark ? '#1a2e22' : '#dcfce7', color: dark ? '#34d399' : '#16a34a' }
                : { background: dark ? '#2d1517' : '#ffe4e6', color: dark ? '#f87171' : '#e11d48' }
            }
          >
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-5">
        <p className="text-3xl font-extrabold tracking-tight" style={{ color: dark ? '#e2e8f0' : '#0f172a' }}>
          {value}
        </p>
        <p className="text-[13px] font-medium mt-1.5" style={{ color: dark ? '#6e7681' : '#64748b' }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] mt-0.5" style={{ color: dark ? '#484f58' : '#94a3b8' }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
