import { TrendingUp, TrendingDown } from 'lucide-react';

const iconColors = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600' },
  green:  { bg: 'bg-green-50',  text: 'text-green-600' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  red:    { bg: 'bg-red-50',    text: 'text-red-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-600' },
  maroon: { bg: 'bg-red-50',    text: 'text-red-800' },
  gold:   { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  sky:    { bg: 'bg-sky-50',    text: 'text-sky-600' },
  rose:   { bg: 'bg-rose-50',   text: 'text-rose-600' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, trend }) {
  const c = iconColors[color] || iconColors.blue;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon size={18} className={c.text} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${
            trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
