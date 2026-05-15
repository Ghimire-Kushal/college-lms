import { X, RefreshCw, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ── SVG thumbnails -───────────────────────────────────────
function ThumbDefault({ selected }) {
  return (
    <svg viewBox="0 0 72 52" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="52" rx="4" fill={selected ? '#eff6ff' : '#f1f5f9'} />
      <rect x="5" y="5" width="14" height="42" rx="2.5" fill="#dde5ee" />
      <rect x="23" y="5" width="44" height="10" rx="2" fill="#dde5ee" />
      <rect x="23" y="19" width="20" height="14" rx="2" fill="#e8edf5" />
      <rect x="46" y="19" width="21" height="14" rx="2" fill="#e8edf5" />
      <rect x="23" y="37" width="44" height="10" rx="2" fill="#e8edf5" />
    </svg>
  );
}

function ThumbBordered({ selected }) {
  return (
    <svg viewBox="0 0 72 52" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="52" rx="4" fill={selected ? '#eff6ff' : '#f1f5f9'} />
      <rect x="5" y="5" width="14" height="42" rx="2.5" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="23" y="5" width="44" height="10" rx="2" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="23" y="19" width="20" height="14" rx="2" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="46" y="19" width="21" height="14" rx="2" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="23" y="37" width="44" height="10" rx="2" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
    </svg>
  );
}

function ThumbFixed({ selected }) {
  return (
    <svg viewBox="0 0 72 52" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="52" rx="4" fill={selected ? '#eff6ff' : '#f1f5f9'} />
      <rect x="0" y="0" width="72" height="12" rx="4" fill="#cbd5e1" />
      <rect x="3" y="2" width="20" height="8" rx="1.5" fill="#94a3b8" />
      <rect x="50" y="3" width="18" height="6" rx="1.5" fill="#94a3b8" />
      <rect x="5" y="17" width="62" height="8" rx="2" fill="#dde5ee" />
      <rect x="5" y="29" width="62" height="8" rx="2" fill="#e8edf5" />
      <rect x="5" y="41" width="38" height="8" rx="2" fill="#e8edf5" />
    </svg>
  );
}

function ThumbStatic({ selected }) {
  return (
    <svg viewBox="0 0 72 52" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="52" rx="4" fill={selected ? '#eff6ff' : '#f1f5f9'} />
      <rect x="5" y="5" width="62" height="10" rx="2" fill="#dde5ee" />
      <rect x="3" y="6" width="18" height="8" rx="1.5" fill="#b0bec5" opacity="0.7" />
      <rect x="5" y="20" width="62" height="8" rx="2" fill="#e8edf5" />
      <rect x="5" y="32" width="62" height="8" rx="2" fill="#e8edf5" />
      <rect x="5" y="42" width="38" height="7" rx="2" fill="#e8edf5" />
    </svg>
  );
}

function ThumbCompact({ selected }) {
  return (
    <svg viewBox="0 0 72 52" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="52" rx="4" fill={selected ? '#eff6ff' : '#f1f5f9'} />
      <rect x="12" y="5" width="48" height="8" rx="2" fill="#dde5ee" />
      <rect x="12" y="17" width="22" height="14" rx="2" fill="#e8edf5" />
      <rect x="38" y="17" width="22" height="14" rx="2" fill="#e8edf5" />
      <rect x="12" y="35" width="48" height="8" rx="2" fill="#e8edf5" />
    </svg>
  );
}

function ThumbWide({ selected }) {
  return (
    <svg viewBox="0 0 72 52" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="52" rx="4" fill={selected ? '#eff6ff' : '#f1f5f9'} />
      <rect x="3" y="5" width="66" height="8" rx="2" fill="#dde5ee" />
      <rect x="3" y="17" width="31" height="14" rx="2" fill="#e8edf5" />
      <rect x="38" y="17" width="31" height="14" rx="2" fill="#e8edf5" />
      <rect x="3" y="35" width="66" height="8" rx="2" fill="#e8edf5" />
    </svg>
  );
}

// ── Option tile ──────────────────────────────────────────
function OptionTile({ label, selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl transition-all focus:outline-none"
      style={{
        border: `2px solid ${selected ? '#3b82f6' : '#e2e8f0'}`,
        background: selected ? '#eff6ff' : '#f8fafc',
        padding: '8px 6px 6px',
      }}
    >
      <div className="w-full aspect-[72/52] rounded overflow-hidden">{children}</div>
      <span className="text-[11px] font-semibold" style={{ color: selected ? '#2563eb' : '#64748b' }}>
        {label}
      </span>
    </button>
  );
}

// ── Mode tile (icon-based) ───────────────────────────────
function ModeTile({ label, icon: Icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 rounded-xl py-5 transition-all focus:outline-none"
      style={{
        border: `2px solid ${selected ? '#3b82f6' : '#e2e8f0'}`,
        background: selected ? '#eff6ff' : '#f8fafc',
      }}
    >
      <Icon size={22} style={{ color: selected ? '#2563eb' : '#94a3b8' }} strokeWidth={1.8} />
      <span className="text-[11px] font-semibold" style={{ color: selected ? '#2563eb' : '#64748b' }}>
        {label}
      </span>
    </button>
  );
}

// ── Section header ───────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3"
      style={{ background: '#e0edff', color: '#2563eb' }}>
      {children}
    </span>
  );
}

// ── Customizer Panel ─────────────────────────────────────
export default function Customizer({ isOpen, onClose }) {
  const { mode, setMode, theme, setTheme, headerType, setHeader, contentWidth, setWidth, reset } = useTheme();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl customizer-panel"
        style={{
          width: 300,
          background: '#ffffff',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
          borderLeft: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#e8edf3' }}>
          <div>
            <h2 className="text-[16px] font-bold" style={{ color: '#1e293b' }}>Template Customizer</h2>
            <p className="text-[12px] mt-0.5" style={{ color: '#94a3b8' }}>Customize and preview in real time</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              title="Reset to defaults"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-70 relative"
              style={{ background: '#f1f5f9', color: '#64748b' }}>
              <RefreshCw size={14} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
              style={{ background: '#f1f5f9', color: '#64748b' }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Theming ── */}
          <div className="px-5 py-5 border-b" style={{ borderColor: '#f1f5f9' }}>
            <SectionLabel>Theming</SectionLabel>

            <p className="text-[12px] font-semibold mb-2" style={{ color: '#334155' }}>Style (Mode)</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              <ModeTile label="Light"  icon={Sun}     selected={mode === 'light'}  onClick={() => setMode('light')} />
              <ModeTile label="Dark"   icon={Moon}    selected={mode === 'dark'}   onClick={() => setMode('dark')} />
              <ModeTile label="System" icon={Monitor} selected={mode === 'system'} onClick={() => setMode('system')} />
            </div>

            <p className="text-[12px] font-semibold mb-2" style={{ color: '#334155' }}>Themes</p>
            <div className="grid grid-cols-2 gap-3">
              <OptionTile label="Default" selected={theme === 'default'} onClick={() => setTheme('default')}>
                <ThumbDefault selected={theme === 'default'} />
              </OptionTile>
              <OptionTile label="Bordered" selected={theme === 'bordered'} onClick={() => setTheme('bordered')}>
                <ThumbBordered selected={theme === 'bordered'} />
              </OptionTile>
            </div>
          </div>

          {/* ── Layout ── */}
          <div className="px-5 py-5">
            <SectionLabel>Layout</SectionLabel>

            <p className="text-[12px] font-semibold mb-2" style={{ color: '#334155' }}>Header Types</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <OptionTile label="Fixed" selected={headerType === 'fixed'} onClick={() => setHeader('fixed')}>
                <ThumbFixed selected={headerType === 'fixed'} />
              </OptionTile>
              <OptionTile label="Static" selected={headerType === 'static'} onClick={() => setHeader('static')}>
                <ThumbStatic selected={headerType === 'static'} />
              </OptionTile>
            </div>

            <p className="text-[12px] font-semibold mb-2" style={{ color: '#334155' }}>Content</p>
            <div className="grid grid-cols-2 gap-3">
              <OptionTile label="Compact" selected={contentWidth === 'compact'} onClick={() => setWidth('compact')}>
                <ThumbCompact selected={contentWidth === 'compact'} />
              </OptionTile>
              <OptionTile label="Wide" selected={contentWidth === 'wide'} onClick={() => setWidth('wide')}>
                <ThumbWide selected={contentWidth === 'wide'} />
              </OptionTile>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
