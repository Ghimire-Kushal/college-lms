import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export default function Modal({ title, children, onClose, size = 'md' }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`relative w-full ${sizes[size]} bg-white border border-slate-200 rounded-lg shadow-xl flex flex-col max-h-[90vh] modal-enter`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <h2 className="font-semibold text-slate-800 text-base">{title}</h2>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
