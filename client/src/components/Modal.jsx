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

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={[
          'relative w-full flex flex-col modal-enter',
          'rounded-t-2xl max-h-[92vh]',
          `sm:rounded-2xl sm:shadow-2xl sm:max-h-[90vh] ${sizes[size]}`,
        ].join(' ')}
        style={{
          background: dark ? '#161b22' : '#ffffff',
          border: `1px solid ${dark ? '#30363d' : '#e8edf3'}`,
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full sm:hidden"
          style={{ background: dark ? '#30363d' : '#e2e8f0' }} />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 sm:px-6 py-4 shrink-0 border-b"
          style={{ borderColor: dark ? '#21262d' : '#f1f5f9' }}
        >
          <h2 className="text-[16px] font-bold mt-1 sm:mt-0" style={{ color: dark ? '#e2e8f0' : '#0f172a' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: dark ? '#6e7681' : '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.background = dark ? '#21262d' : '#f1f5f9'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
