import { Search } from 'lucide-react';

export const inputCls = 'w-full px-3 py-2 rounded-md text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition';
export const selectCls = inputCls;
export const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

export function useInputStyle() { return {}; }

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-1 border-b border-slate-200">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap shrink-0">{children}</div>}
    </div>
  );
}

export function PrimaryBtn({ children, className = '', ...props }) {
  return (
    <button
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, className = '', ...props }) {
  return (
    <button
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function DangerBtn({ children, className = '', ...props }) {
  return (
    <button
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative flex-1">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 rounded-md text-sm bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      />
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

export function TableHead({ cols }) {
  return (
    <thead>
      <tr className="bg-slate-50 border-b border-slate-200">
        {cols.map(col => (
          <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
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
      <td colSpan={cols} className="text-center py-12 text-sm text-slate-400">{message}</td>
    </tr>
  );
}

export function Avatar({ name, index = 0, size = 'md' }) {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-500', 'bg-rose-500', 'bg-teal-500', 'bg-indigo-500'];
  const color = colors[index % colors.length];
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-11 h-11 text-sm' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export function Badge({ children, color = 'slate' }) {
  const styles = {
    slate:  'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-50 text-indigo-700',
    green:  'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red:    'bg-red-50 text-red-700',
    blue:   'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    violet: 'bg-violet-50 text-violet-700',
  };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${styles[color] || styles.slate}`}>
      {children}
    </span>
  );
}

export function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

export function ModalActions({ onCancel, loading, saveLabel = 'Save', cancelLabel = 'Cancel' }) {
  return (
    <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-slate-200">
      <SecondaryBtn type="button" onClick={onCancel}>{cancelLabel}</SecondaryBtn>
      <PrimaryBtn type="submit" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Saving...
          </span>
        ) : saveLabel}
      </PrimaryBtn>
    </div>
  );
}

export function IconBtn({ icon: Icon, onClick, color = 'slate', title }) {
  const styles = {
    slate:  'text-slate-400 hover:text-slate-700 hover:bg-slate-100',
    red:    'text-slate-400 hover:text-red-600 hover:bg-red-50',
    green:  'text-slate-400 hover:text-green-600 hover:bg-green-50',
    blue:   'text-slate-400 hover:text-blue-600 hover:bg-blue-50',
    indigo: 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50',
  };
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded transition ${styles[color] || styles.slate}`}
    >
      <Icon size={14} />
    </button>
  );
}
