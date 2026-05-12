import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const themes = {
  indigo:  { bg: 'from-indigo-500 to-indigo-600',   soft: 'bg-indigo-50',  text: 'text-indigo-600',  icon: 'bg-indigo-100 text-indigo-600' },
  violet:  { bg: 'from-violet-500 to-purple-600',   soft: 'bg-violet-50',  text: 'text-violet-600',  icon: 'bg-violet-100 text-violet-600' },
  green:   { bg: 'from-emerald-500 to-teal-600',    soft: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100 text-emerald-600' },
  yellow:  { bg: 'from-amber-400 to-orange-500',    soft: 'bg-amber-50',   text: 'text-amber-600',   icon: 'bg-amber-100 text-amber-600' },
  red:     { bg: 'from-rose-500 to-red-600',        soft: 'bg-rose-50',    text: 'text-rose-600',    icon: 'bg-rose-100 text-rose-600' },
  blue:    { bg: 'from-blue-500 to-cyan-600',       soft: 'bg-blue-50',    text: 'text-blue-600',    icon: 'bg-blue-100 text-blue-600' },
  purple:  { bg: 'from-purple-500 to-fuchsia-600',  soft: 'bg-purple-50',  text: 'text-purple-600',  icon: 'bg-purple-100 text-purple-600' },
  sky:     { bg: 'from-sky-500 to-blue-600',        soft: 'bg-sky-50',     text: 'text-sky-600',     icon: 'bg-sky-100 text-sky-600' },
};

export default function StatCard({ title, value, icon: Icon, color = 'indigo', subtitle, trend, gradient = false }) {
  const t = themes[color] || themes.indigo;

  if (gradient) {
    return (
      <div className={`rounded-2xl bg-gradient-to-br ${t.bg} p-5 text-white shadow-lg card-hover`}>
        <div className="flex items-start justify-between">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
            <Icon size={20} className="text-white" />
          </div>
          {trend !== undefined && (
            <span className="flex items-center gap-1 text-[11px] font-semibold bg-white/20 px-2 py-1 rounded-full">
              {trend > 0 ? <TrendingUp size={11} /> : trend < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-[13px] font-medium mt-1 text-white/75">{title}</p>
          {subtitle && <p className="text-[11px] text-white/60 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover">
      <div className="flex items-start justify-between">
        <div className={`${t.icon} rounded-xl p-2.5`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
        <p className="text-[13px] font-medium text-slate-500 mt-1">{title}</p>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
