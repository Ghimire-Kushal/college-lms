import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const iconColors = {
  primary: { bg: '#f3f4f6', icon: '#111827' },
  blue:    { bg: '#eff6ff', icon: '#2563eb' },
  green:   { bg: '#f0fdf4', icon: '#16a34a' },
  yellow:  { bg: '#fefce8', icon: '#ca8a04' },
  red:     { bg: '#fef2f2', icon: '#dc2626' },
  purple:  { bg: '#faf5ff', icon: '#7c3aed' },
  sky:     { bg: '#f0f9ff', icon: '#0284c7' },
  indigo:  { bg: '#eef2ff', icon: '#4338ca' },
  teal:    { bg: '#f0fdfa', icon: '#0d9488' },
  orange:  { bg: '#fff7ed', icon: '#ea580c' },
  // Legacy color names mapped to new system
  maroon:  { bg: '#fef2f2', icon: '#dc2626' },
  gold:    { bg: '#fefce8', icon: '#ca8a04' },
  rose:    { bg: '#fff1f2', icon: '#e11d48' },
};

const iconColorsDark = {
  primary: { bg: '#374151', icon: '#e5e7eb' },
  blue:    { bg: '#1e3a5f', icon: '#60a5fa' },
  green:   { bg: '#052e16', icon: '#34d399' },
  yellow:  { bg: '#422006', icon: '#fbbf24' },
  red:     { bg: '#450a0a', icon: '#f87171' },
  purple:  { bg: '#2e1065', icon: '#c084fc' },
  sky:     { bg: '#082f49', icon: '#38bdf8' },
  indigo:  { bg: '#1e1b4b', icon: '#818cf8' },
  teal:    { bg: '#042f2e', icon: '#2dd4bf' },
  orange:  { bg: '#431407', icon: '#fb923c' },
  maroon:  { bg: '#450a0a', icon: '#f87171' },
  gold:    { bg: '#422006', icon: '#fbbf24' },
  rose:    { bg: '#4c0519', icon: '#fb7185' },
};

export default function StatCard({ title, value, icon: Icon, color = 'primary', subtitle, trend, gradient }) {
  const { dark } = useTheme();
  const palette = dark ? iconColorsDark : iconColors;
  const c = palette[color] || palette.primary;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: dark ? '#1e293b' : '#ffffff',
        border:     `1px solid ${dark ? '#334155' : '#e5e7eb'}`,
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: c.bg }}
        >
          <Icon size={20} style={{ color: c.icon }} />
        </div>
        {trend !== undefined && (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md"
            style={
              trend >= 0
                ? { background: dark ? '#052e16' : '#f0fdf4', color: dark ? '#34d399' : '#16a34a' }
                : { background: dark ? '#450a0a' : '#fef2f2', color: dark ? '#f87171' : '#dc2626' }
            }
          >
            {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-[28px] font-bold tracking-tight" style={{ color: dark ? '#f1f5f9' : '#111827' }}>
          {value}
        </p>
        <p className="text-[13px] mt-1" style={{ color: dark ? '#94a3b8' : '#6b7280' }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[12px] mt-0.5" style={{ color: dark ? '#475569' : '#9ca3af' }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
