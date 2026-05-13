import { Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ── String class constants ───────────────────────── */
export const inputCls = [
  'w-full px-4 py-3 rounded-xl text-[14px] text-slate-800 placeholder-slate-400',
  'bg-white border border-slate-200 shadow-sm',
  'focus:outline-none focus:ring-2 focus:border-transparent',
  'transition-shadow',
].join(' ');

export const selectCls = inputCls;
export const labelCls = 'block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider';

/* ── Theme-aware input styles (inline style objects) ─ */
export function useInputStyle() {
  const { dark } = useTheme();
  return {
    background: dark ? '#21262d' : '#ffffff',
    borderColor: dark ? '#30363d' : '#e2e8f0',
    color: dark ? '#e2e8f0' : '#1e293b',
  };
}

/* ── Page Header ──────────────────────────────────── */
export function PageHeader({ title, subtitle, children }) {
  const { dark } = useTheme();
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-1 border-b"
      style={{ borderColor: dark ? '#21262d' : '#e8edf3' }}
    >
      <div>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: dark ? '#e2e8f0' : '#0f172a' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: dark ? '#6e7681' : '#64748b' }}>
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap shrink-0">{children}</div>}
    </div>
  );
}

/* ── Buttons ──────────────────────────────────────── */
export function PrimaryBtn({ children, className = '', ...props }) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.97] ${className}`}
      style={{ background: 'linear-gradient(135deg, #8B3030, #6b2525)', boxShadow: '0 4px 12px rgba(122,46,46,0.35)' }}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, className = '', ...props }) {
  const { dark } = useTheme();
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium shadow-sm transition-all active:scale-[0.97] ${className}`}
      style={{
        background: dark ? '#21262d' : '#ffffff',
        border: `1px solid ${dark ? '#30363d' : '#e2e8f0'}`,
        color: dark ? '#c9d1d9' : '#475569',
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function DangerBtn({ children, className = '', ...props }) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white shadow-sm disabled:opacity-60 transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.97] ${className}`}
      style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Search bar ───────────────────────────────────── */
export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  const { dark } = useTheme();
  return (
    <div className="relative flex-1">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: dark ? '#6e7681' : '#94a3b8' }} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:border-transparent shadow-sm transition-shadow"
        style={{
          background: dark ? '#21262d' : '#ffffff',
          border: `1px solid ${dark ? '#30363d' : '#e2e8f0'}`,
          color: dark ? '#e2e8f0' : '#334155',
        }}
      />
    </div>
  );
}

/* ── Card ─────────────────────────────────────────── */
export function Card({ children, className = '' }) {
  const { dark } = useTheme();
  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-sm ${className}`}
      style={{
        background: dark ? '#161b22' : '#ffffff',
        border: `1px solid ${dark ? '#21262d' : '#e8edf3'}`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Table Head ───────────────────────────────────── */
export function TableHead({ cols }) {
  const { dark } = useTheme();
  return (
    <thead>
      <tr style={{
        background: dark ? 'linear-gradient(to right,#1c2130,#1a2030)' : 'linear-gradient(to right,#f8fafc,#f0f4f8)',
        borderBottom: `2px solid ${dark ? '#21262d' : '#e8edf3'}`,
      }}>
        {cols.map(col => (
          <th
            key={col}
            className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap"
            style={{ color: dark ? '#6e7681' : '#94a3b8' }}
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/* ── Empty Row ────────────────────────────────────── */
export function EmptyRow({ cols, message = 'No data found' }) {
  const { dark } = useTheme();
  return (
    <tr>
      <td colSpan={cols} className="text-center py-16 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: dark ? '#21262d' : '#f0f4f8',
              border: `1px solid ${dark ? '#30363d' : '#e2e8f0'}`,
            }}
          >
            <Search size={20} style={{ color: dark ? '#484f58' : '#cbd5e1' }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: dark ? '#8b949e' : '#64748b' }}>{message}</p>
            <p className="text-[12px] mt-0.5" style={{ color: dark ? '#6e7681' : '#94a3b8' }}>
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ── Avatar ───────────────────────────────────────── */
export function Avatar({ name, index = 0, size = 'md' }) {
  const hue = (index * 67 + 200) % 360;
  const sz = size === 'sm' ? 'w-8 h-8 text-[11px]' : size === 'lg' ? 'w-12 h-12 text-sm' : 'w-10 h-10 text-xs';
  return (
    <div
      className={`${sz} rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm`}
      style={{ background: `hsl(${hue}, 65%, 52%)` }}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

/* ── Badge ────────────────────────────────────────── */
export function Badge({ children, color = 'slate' }) {
  const { dark } = useTheme();
  const colors = {
    slate:  dark ? { bg: '#2d333b', text: '#8b949e', border: '#444c56' } : { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
    indigo: dark ? { bg: '#1e2d4f', text: '#818cf8', border: '#2d3d6a' } : { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' },
    green:  dark ? { bg: '#1a2e22', text: '#34d399', border: '#1e4030' } : { bg: '#f0fdf4', text: '#059669', border: '#bbf7d0' },
    yellow: dark ? { bg: '#2d2712', text: '#fbbf24', border: '#3d3318' } : { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    red:    dark ? { bg: '#2d1517', text: '#f87171', border: '#3d1f22' } : { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' },
    blue:   dark ? { bg: '#1a2a3f', text: '#60a5fa', border: '#2d3d56' } : { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    purple: dark ? { bg: '#241e36', text: '#c084fc', border: '#33285a' } : { bg: '#faf5ff', text: '#7c3aed', border: '#ddd6fe' },
    violet: dark ? { bg: '#221e36', text: '#a78bfa', border: '#302857' } : { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
  };
  const c = colors[color] || colors.slate;
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {children}
    </span>
  );
}

/* ── Form Field ───────────────────────────────────── */
export function FormField({ label, children }) {
  const { dark } = useTheme();
  return (
    <div>
      <label
        className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider"
        style={{ color: dark ? '#6e7681' : '#64748b' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Modal Actions ────────────────────────────────── */
export function ModalActions({ onCancel, loading, saveLabel = 'Save', cancelLabel = 'Cancel' }) {
  const { dark } = useTheme();
  return (
    <div
      className="flex gap-3 justify-end pt-4 mt-4 border-t"
      style={{ borderColor: dark ? '#21262d' : '#f1f5f9' }}
    >
      <SecondaryBtn type="button" onClick={onCancel}>{cancelLabel}</SecondaryBtn>
      <PrimaryBtn type="submit" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Saving...
          </span>
        ) : saveLabel}
      </PrimaryBtn>
    </div>
  );
}

/* ── Icon Button ──────────────────────────────────── */
export function IconBtn({ icon: Icon, onClick, color = 'slate', title }) {
  const { dark } = useTheme();
  const styles = {
    slate:  { color: dark ? '#6e7681' : '#94a3b8', hoverBg: dark ? '#21262d' : '#f1f5f9', hoverColor: dark ? '#c9d1d9' : '#475569' },
    red:    { color: dark ? '#6e7681' : '#94a3b8', hoverBg: dark ? '#2d1517' : '#fff1f2', hoverColor: '#f87171' },
    green:  { color: dark ? '#6e7681' : '#94a3b8', hoverBg: dark ? '#1a2e22' : '#f0fdf4', hoverColor: '#34d399' },
    blue:   { color: dark ? '#6e7681' : '#94a3b8', hoverBg: dark ? '#1a2a3f' : '#eff6ff', hoverColor: '#60a5fa' },
    indigo: { color: dark ? '#6e7681' : '#94a3b8', hoverBg: dark ? '#1e2d4f' : '#eef2ff', hoverColor: '#818cf8' },
  };
  const s = styles[color] || styles.slate;
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="p-2 rounded-lg transition-colors"
      style={{ color: s.color }}
      onMouseEnter={e => { e.currentTarget.style.background = s.hoverBg; e.currentTarget.style.color = s.hoverColor; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = s.color; }}
    >
      <Icon size={15} />
    </button>
  );
}
