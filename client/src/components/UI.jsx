import { Search, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ── Input class string ───────────────────────────── */
export const inputCls = [
  'w-full px-3 py-2.5 rounded-lg text-[14px]',
  'bg-white border border-[#e5e7eb] text-[#111827] placeholder-[#9ca3af]',
  'focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent',
  'transition-shadow',
  'dark:bg-[#1e293b] dark:border-[#334155] dark:text-[#f1f5f9] dark:placeholder-[#64748b]',
].join(' ');

export const selectCls = inputCls;
export const labelCls = 'block text-[12px] font-semibold text-[#6b7280] mb-1.5 uppercase tracking-wide';

/* ── Theme-aware input styles ─────────────────────── */
export function useInputStyle() {
  const { dark } = useTheme();
  return {
    background:  dark ? '#1e293b' : '#ffffff',
    borderColor: dark ? '#334155' : '#e5e7eb',
    color:       dark ? '#f1f5f9' : '#111827',
  };
}

/* ── Page Header ──────────────────────────────────── */
export function PageHeader({ title, subtitle, children }) {
  const { dark } = useTheme();
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 mb-2 border-b"
      style={{ borderColor: dark ? '#334155' : '#e5e7eb' }}
    >
      <div>
        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: dark ? '#f1f5f9' : '#111827' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] mt-1" style={{ color: dark ? '#94a3b8' : '#6b7280' }}>
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-wrap shrink-0 sm:mt-1">{children}</div>
      )}
    </div>
  );
}

/* ── Buttons ──────────────────────────────────────── */
export function PrimaryBtn({ children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-[#1f2937] active:scale-[0.98] ${className}`}
      style={{ background: '#111827' }}
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
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors active:scale-[0.98] ${className}`}
      style={{
        background:  dark ? '#1e293b' : '#ffffff',
        border:      `1px solid ${dark ? '#334155' : '#e5e7eb'}`,
        color:       dark ? '#e2e8f0' : '#374151',
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
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50 transition-colors hover:bg-[#dc2626] active:scale-[0.98] ${className}`}
      style={{ background: '#ef4444' }}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, className = '', ...props }) {
  const { dark } = useTheme();
  return (
    <button
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${className}`}
      style={{ color: dark ? '#94a3b8' : '#6b7280' }}
      onMouseEnter={e => { e.currentTarget.style.background = dark ? '#1e293b' : '#f9fafb'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
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
    <div className="relative flex-1 min-w-0">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: dark ? '#64748b' : '#9ca3af' }}
      />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 rounded-lg text-[14px] focus:outline-none focus:ring-2 transition-shadow"
        style={{
          background:  dark ? '#1e293b' : '#ffffff',
          border:      `1px solid ${dark ? '#334155' : '#e5e7eb'}`,
          color:       dark ? '#f1f5f9' : '#111827',
          '--tw-ring-color': '#111827',
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
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: dark ? '#1e293b' : '#ffffff',
        border:     `1px solid ${dark ? '#334155' : '#e5e7eb'}`,
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
        background:   dark ? '#0f172a' : '#f9fafb',
        borderBottom: `1px solid ${dark ? '#334155' : '#e5e7eb'}`,
      }}>
        {cols.map(col => (
          <th
            key={col}
            className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
            style={{ color: dark ? '#64748b' : '#6b7280' }}
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
      <td colSpan={cols} className="text-center py-14">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: dark ? '#0f172a' : '#f9fafb', border: `1px solid ${dark ? '#334155' : '#e5e7eb'}` }}
          >
            <Search size={18} style={{ color: dark ? '#475569' : '#d1d5db' }} />
          </div>
          <div>
            <p className="text-[14px] font-medium" style={{ color: dark ? '#94a3b8' : '#6b7280' }}>{message}</p>
            <p className="text-[12px] mt-0.5" style={{ color: dark ? '#475569' : '#9ca3af' }}>
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ── Avatar ───────────────────────────────────────── */
export function Avatar({ name, index = 0, size = 'md', src }) {
  const colors = [
    '#111827', '#1d4ed8', '#059669', '#d97706', '#7c3aed',
    '#db2777', '#0891b2', '#16a34a', '#dc2626', '#9333ea',
  ];
  const bg = colors[index % colors.length];
  const sz = size === 'sm' ? 'w-7 h-7 text-[11px]' : size === 'lg' ? 'w-11 h-11 text-sm' : 'w-9 h-9 text-[12px]';
  return (
    <div
      className={`${sz} rounded-lg flex items-center justify-center font-semibold text-white shrink-0 overflow-hidden`}
      style={{ background: bg }}
    >
      {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : name?.[0]?.toUpperCase()}
    </div>
  );
}

/* ── Badge ────────────────────────────────────────── */
export function Badge({ children, color = 'slate' }) {
  const colors = {
    slate:  { bg: '#f9fafb',  text: '#6b7280',  border: '#e5e7eb' },
    green:  { bg: '#f0fdf4',  text: '#16a34a',  border: '#bbf7d0' },
    yellow: { bg: '#fefce8',  text: '#ca8a04',  border: '#fde68a' },
    red:    { bg: '#fef2f2',  text: '#dc2626',  border: '#fecaca' },
    blue:   { bg: '#eff6ff',  text: '#2563eb',  border: '#bfdbfe' },
    purple: { bg: '#faf5ff',  text: '#7c3aed',  border: '#ddd6fe' },
    indigo: { bg: '#eef2ff',  text: '#4338ca',  border: '#c7d2fe' },
    orange: { bg: '#fff7ed',  text: '#ea580c',  border: '#fed7aa' },
    teal:   { bg: '#f0fdfa',  text: '#0d9488',  border: '#99f6e4' },
    violet: { bg: '#f5f3ff',  text: '#6d28d9',  border: '#ddd6fe' },
  };
  const c = colors[color] || colors.slate;
  return (
    <span
      className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border"
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
        className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wide"
        style={{ color: dark ? '#64748b' : '#6b7280' }}
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
      style={{ borderColor: dark ? '#334155' : '#e5e7eb' }}
    >
      <SecondaryBtn type="button" onClick={onCancel}>{cancelLabel}</SecondaryBtn>
      <PrimaryBtn type="submit" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
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
  const hoverColors = {
    slate:  { bg: dark ? '#0f172a' : '#f9fafb', color: dark ? '#e2e8f0' : '#374151' },
    red:    { bg: dark ? '#450a0a' : '#fef2f2', color: '#dc2626' },
    green:  { bg: dark ? '#052e16' : '#f0fdf4', color: '#16a34a' },
    blue:   { bg: dark ? '#1e3a5f' : '#eff6ff', color: '#2563eb' },
    indigo: { bg: dark ? '#1e1b4b' : '#eef2ff', color: '#4338ca' },
  };
  const h = hoverColors[color] || hoverColors.slate;
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="p-1.5 rounded-md transition-colors"
      style={{ color: dark ? '#64748b' : '#9ca3af' }}
      onMouseEnter={e => { e.currentTarget.style.background = h.bg; e.currentTarget.style.color = h.color; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = dark ? '#64748b' : '#9ca3af'; }}
    >
      <Icon size={14} />
    </button>
  );
}

/* ── Section Header (for card headers) ───────────── */
export function SectionHeader({ title, subtitle, children }) {
  const { dark } = useTheme();
  return (
    <div
      className="flex items-center justify-between px-5 py-4 border-b"
      style={{ borderColor: dark ? '#334155' : '#e5e7eb' }}
    >
      <div>
        <h3 className="text-[14px] font-semibold" style={{ color: dark ? '#f1f5f9' : '#111827' }}>{title}</h3>
        {subtitle && <p className="text-[12px] mt-0.5" style={{ color: dark ? '#64748b' : '#9ca3af' }}>{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
