import { Search } from 'lucide-react';

export const inputCls = 'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-shadow';
export const selectCls = inputCls;
export const labelCls = 'block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider';

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 mb-1">
      <div>
        <h1 className="text-[22px] font-bold text-slate-800 tracking-tight leading-none">{title}</h1>
        {subtitle && <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap shrink-0">{children}</div>}
    </div>
  );
}

export function PrimaryBtn({ children, className = '', ...props }) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-md active:scale-[0.98] ${className}`}
      style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, className = '', ...props }) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all active:scale-[0.98] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function DangerBtn({ children, className = '', ...props }) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm disabled:opacity-60 transition-all hover:shadow-md active:scale-[0.98] ${className}`}
      style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
      {...props}
    >
      {children}
    </button>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative flex-1">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-shadow"
      />
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function TableHead({ cols }) {
  return (
    <thead>
      <tr className="border-b-2 border-slate-100" style={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)' }}>
        {cols.map(col => (
          <th key={col} className="text-left px-4 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function EmptyRow({ cols, message = 'No data found' }) {
  return (
    <tr>
      <td colSpan={cols} className="text-center py-14 text-slate-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
            <Search size={18} className="text-slate-300" />
          </div>
          <div>
            <p className="font-medium text-slate-500">{message}</p>
            <p className="text-[12px] text-slate-400 mt-0.5">Try adjusting your search or filters</p>
          </div>
        </div>
      </td>
    </tr>
  );
}

export function Avatar({ name, index = 0, size = 'md' }) {
  const hue = (index * 67 + 200) % 360;
  const sz = size === 'sm' ? 'w-7 h-7 text-[10px]' : size === 'lg' ? 'w-11 h-11 text-sm' : 'w-9 h-9 text-xs';
  return (
    <div
      className={`${sz} rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm`}
      style={{ background: `hsl(${hue}, 65%, 52%)` }}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export function Badge({ children, color = 'slate' }) {
  const colors = {
    slate:   'bg-slate-100 text-slate-600 border-slate-200',
    indigo:  'bg-indigo-50 text-indigo-700 border-indigo-100',
    green:   'bg-emerald-50 text-emerald-700 border-emerald-100',
    yellow:  'bg-amber-50 text-amber-700 border-amber-100',
    red:     'bg-rose-50 text-rose-700 border-rose-100',
    blue:    'bg-sky-50 text-sky-700 border-sky-100',
    purple:  'bg-purple-50 text-purple-700 border-purple-100',
    violet:  'bg-violet-50 text-violet-700 border-violet-100',
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
}

export function FormField({ label, children }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

export function ModalActions({ onCancel, loading, saveLabel = 'Save', cancelLabel = 'Cancel' }) {
  return (
    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-4">
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

export function IconBtn({ icon: Icon, onClick, color = 'slate', title }) {
  const colors = {
    slate:  'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
    red:    'text-slate-400 hover:bg-rose-50 hover:text-rose-600',
    green:  'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600',
    blue:   'text-slate-400 hover:bg-sky-50 hover:text-sky-600',
    indigo: 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600',
  };
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${colors[color] || colors.slate}`}
    >
      <Icon size={14} />
    </button>
  );
}
