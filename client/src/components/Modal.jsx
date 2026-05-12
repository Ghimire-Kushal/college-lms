import { useEffect } from 'react';
import { X } from 'lucide-react';

const sizes = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };

export default function Modal({ title, children, onClose, size = 'md' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={[
        'bg-white w-full flex flex-col modal-enter',
        /* Mobile: slide up from bottom, full width, rounded top corners */
        'rounded-t-2xl max-h-[92vh]',
        /* Desktop: centered, rounded all corners, constrained width */
        `sm:rounded-2xl sm:shadow-2xl sm:max-h-[90vh] ${sizes[size]}`,
      ].join(' ')}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0">
          {/* Drag handle (mobile UX hint) */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-200 rounded-full sm:hidden" />
          <h2 className="text-[15px] font-semibold text-slate-800 mt-1 sm:mt-0">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="px-5 sm:px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
