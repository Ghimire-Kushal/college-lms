import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const sizes = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };

export default function Modal({ title, children, onClose, size = 'md' }) {
  const { dark } = useTheme();

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const bg     = dark ? '#1e293b' : '#ffffff';
  const border = dark ? '#334155' : '#e5e7eb';
  const titleColor = dark ? '#f1f5f9' : '#111827';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={[
          'relative w-full flex flex-col modal-enter',
          'rounded-t-xl max-h-[92vh]',
          `sm:rounded-xl sm:shadow-xl sm:max-h-[88vh] ${sizes[size]}`,
        ].join(' ')}
        style={{ background: bg, border: `1px solid ${border}` }}
      >
        {/* Drag handle (mobile) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full sm:hidden"
          style={{ background: border }} />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 sm:px-6 py-4 shrink-0 border-b"
          style={{ borderColor: border }}
        >
          <h2 className="text-[15px] font-semibold mt-1 sm:mt-0" style={{ color: titleColor }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
            style={{ color: dark ? '#64748b' : '#9ca3af' }}
            onMouseEnter={e => { e.currentTarget.style.background = dark ? '#0f172a' : '#f9fafb'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
