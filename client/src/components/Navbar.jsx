import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Bell, Menu, KeyRound, LogOut, User, X,
  Eye, EyeOff, CheckCheck, UserCheck, ClipboardList, BarChart2, Info,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const routeMeta = {
  '/admin':                 { label: 'Dashboard' },
  '/admin/students':        { label: 'Students' },
  '/admin/teachers':        { label: 'Teachers' },
  '/admin/courses':         { label: 'Courses' },
  '/admin/timetable':       { label: 'Timetable' },
  '/admin/attendance':      { label: 'Attendance' },
  '/admin/notices':         { label: 'Notices' },
  '/admin/results':         { label: 'Results' },
  '/admin/feedback':        { label: 'Feedback' },
  '/admin/profile':         { label: 'My Profile' },
  '/teacher':               { label: 'Dashboard' },
  '/teacher/courses':       { label: 'My Courses' },
  '/teacher/attendance':    { label: 'Attendance' },
  '/teacher/notes':         { label: 'Notes & Materials' },
  '/teacher/assignments':   { label: 'Assignments' },
  '/teacher/results':       { label: 'Results' },
  '/teacher/notices':       { label: 'Notices' },
  '/teacher/online-classes':{ label: 'Online Classes' },
  '/teacher/profile':       { label: 'My Profile' },
  '/student':               { label: 'Dashboard' },
  '/student/courses':       { label: 'My Courses' },
  '/student/attendance':    { label: 'Attendance' },
  '/student/notes':         { label: 'Notes & Materials' },
  '/student/assignments':   { label: 'Assignments' },
  '/student/results':       { label: 'Results' },
  '/student/notices':       { label: 'Notices' },
  '/student/online-classes':{ label: 'Online Classes' },
  '/student/timetable':     { label: 'Class Routine' },
  '/student/fees':          { label: 'Fee Details' },
  '/student/library':       { label: 'Library' },
  '/student/feedback':      { label: 'Feedback' },
  '/student/progress':      { label: 'Academic Progress' },
  '/student/profile':       { label: 'My Profile' },
};

const typeIcon  = { attendance: UserCheck, assignment: ClipboardList, result: BarChart2, notice: Bell, general: Info };

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function PasswordModal({ onClose }) {
  const { dark } = useTheme();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [show, setShow] = useState({ cur: false, new: false, con: false });
  const [loading, setLoading] = useState(false);

  const bg     = dark ? '#1e293b' : '#ffffff';
  const border = dark ? '#334155' : '#e5e7eb';
  const inputStyle = {
    background: dark ? '#0f172a' : '#f9fafb',
    borderColor: border,
    color: dark ? '#f1f5f9' : '#111827',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    if (form.newPassword.length < 6) return toast.error('Minimum 6 characters required');
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'currentPassword', label: 'Current Password', showKey: 'cur' },
    { key: 'newPassword',     label: 'New Password',     showKey: 'new' },
    { key: 'confirm',         label: 'Confirm Password', showKey: 'con' },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-xl overflow-hidden"
        style={{ background: bg, border: `1px solid ${border}` }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: border }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: dark ? '#0f172a' : '#f9fafb' }}>
              <KeyRound size={15} style={{ color: dark ? '#94a3b8' : '#6b7280' }} />
            </div>
            <div>
              <h3 className="font-semibold text-[14px]" style={{ color: dark ? '#f1f5f9' : '#111827' }}>Change Password</h3>
              <p className="text-[11px]" style={{ color: dark ? '#64748b' : '#9ca3af' }}>Update your account password</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
            style={{ color: dark ? '#64748b' : '#9ca3af' }}
            onMouseEnter={e => { e.currentTarget.style.background = dark ? '#0f172a' : '#f9fafb'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {fields.map(({ key, label, showKey }) => (
            <div key={key}>
              <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: dark ? '#64748b' : '#6b7280' }}>{label}</label>
              <div className="relative">
                <input
                  type={show[showKey] ? 'text' : 'password'}
                  required
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 pr-9 rounded-lg text-[13px] border outline-none transition-all focus:ring-2 focus:ring-[#111827]"
                  style={inputStyle}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: dark ? '#64748b' : '#9ca3af' }}>
                  {show[showKey] ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-medium border transition-colors"
              style={{ borderColor: border, color: dark ? '#94a3b8' : '#6b7280' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-colors disabled:opacity-60"
              style={{ background: '#111827' }}>
              {loading ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [pwModal, setPwModal]   = useState(false);
  const [notifs, setNotifs]     = useState([]);
  const dropRef = useRef(null);
  const bellRef = useRef(null);
  const meta = routeMeta[pathname] || { label: 'Apollo International College' };

  const unread = notifs.filter(n => !n.read).length;

  const fetchNotifs = useCallback(async () => {
    try { const r = await api.get('/notifications'); setNotifs(r.data); } catch {}
  }, []);

  useEffect(() => {
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 30000);
    return () => clearInterval(iv);
  }, [fetchNotifs]);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifs(n => n.map(x => ({ ...x, read: true })));
  };

  const markRead = async (id) => {
    setNotifs(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    await api.put(`/notifications/${id}/read`);
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const bg     = dark ? '#0f172a' : '#ffffff';
  const border = dark ? '#1e293b' : '#e5e7eb';
  const textPrimary = dark ? '#f1f5f9' : '#111827';
  const textMuted   = dark ? '#64748b' : '#9ca3af';
  const surfaceBg   = dark ? '#1e293b' : '#f9fafb';

  return (
    <>
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 gap-4 border-b transition-colors"
        style={{ height: 'var(--navbar-height)', background: bg, borderColor: border }}
      >
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md transition-colors"
            style={{ color: textMuted }}
            onMouseEnter={e => { e.currentTarget.style.background = surfaceBg; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Menu size={18} />
          </button>
          <h1 className="text-[15px] font-semibold truncate" style={{ color: textPrimary }}>
            {meta.label}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
            style={{ color: textMuted }}
            title={dark ? 'Light mode' : 'Dark mode'}
            onMouseEnter={e => { e.currentTarget.style.background = surfaceBg; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            {dark
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>

          {/* Notifications */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => { setBellOpen(o => !o); setDropOpen(false); }}
              className="relative w-8 h-8 flex items-center justify-center rounded-md transition-colors"
              style={{ color: textMuted }}
              onMouseEnter={e => { e.currentTarget.style.background = surfaceBg; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Bell size={15} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ef4444]" />
              )}
            </button>

            {bellOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-76 rounded-xl shadow-lg border overflow-hidden z-50"
                style={{ background: dark ? '#1e293b' : '#ffffff', borderColor: border, width: 320 }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: border }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold" style={{ color: textPrimary }}>Notifications</span>
                    {unread > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white bg-[#ef4444]">
                        {unread}
                      </span>
                    )}
                  </div>
                  {unread > 0 && (
                    <button onClick={markAllRead}
                      className="flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-70"
                      style={{ color: textMuted }}>
                      <CheckCheck size={11} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell size={20} className="mx-auto mb-2" style={{ color: dark ? '#334155' : '#e5e7eb' }} />
                      <p className="text-[12px]" style={{ color: textMuted }}>No notifications</p>
                    </div>
                  ) : notifs.map(n => {
                    const Icon = typeIcon[n.type] || Info;
                    return (
                      <div key={n._id}
                        onClick={() => markRead(n._id)}
                        className="flex gap-3 px-4 py-3 cursor-pointer border-b last:border-b-0 transition-colors"
                        style={{
                          borderColor: border,
                          background: n.read ? 'transparent' : (dark ? 'rgba(255,255,255,0.03)' : '#f9fafb'),
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = dark ? '#0f172a' : '#f9fafb'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : (dark ? 'rgba(255,255,255,0.03)' : '#f9fafb'); }}
                      >
                        <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: dark ? '#0f172a' : '#f3f4f6' }}>
                          <Icon size={13} style={{ color: textMuted }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[12px] font-medium leading-snug" style={{ color: textPrimary }}>
                              {n.title}
                            </p>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] shrink-0 mt-1" />}
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: textMuted }}>{n.message}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: dark ? '#475569' : '#d1d5db' }}>
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5" style={{ background: border }} />

          {/* User dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropOpen(o => !o)}
              className="flex items-center gap-2 pl-1 transition-opacity hover:opacity-80"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-semibold leading-none" style={{ color: textPrimary }}>{user?.name}</p>
                <p className="text-[11px] mt-0.5 capitalize" style={{ color: textMuted }}>{user?.role}</p>
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-semibold shrink-0 overflow-hidden"
                style={{ background: '#111827' }}
              >
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  : user?.name?.[0]?.toUpperCase()}
              </div>
            </button>

            {dropOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-48 rounded-xl shadow-lg border overflow-hidden z-50"
                style={{ background: dark ? '#1e293b' : '#ffffff', borderColor: border }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: border }}>
                  <p className="text-[13px] font-semibold truncate" style={{ color: textPrimary }}>{user?.name}</p>
                  <p className="text-[11px] capitalize" style={{ color: textMuted }}>{user?.role}</p>
                </div>
                <div className="py-1">
                  {[
                    { label: 'My Profile', icon: User, action: () => { setDropOpen(false); navigate(`/${user?.role}/profile`); } },
                    { label: 'Change Password', icon: KeyRound, action: () => { setDropOpen(false); setPwModal(true); } },
                  ].map(({ label, icon: Icon, action }) => (
                    <button key={label} onClick={action}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors text-left"
                      style={{ color: dark ? '#e2e8f0' : '#374151' }}
                      onMouseEnter={e => { e.currentTarget.style.background = dark ? '#0f172a' : '#f9fafb'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <Icon size={13} style={{ color: textMuted }} />
                      {label}
                    </button>
                  ))}
                  <div className="mx-4 my-1 border-t" style={{ borderColor: border }} />
                  <button onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors text-left text-[#ef4444]"
                    onMouseEnter={e => { e.currentTarget.style.background = dark ? '#450a0a' : '#fef2f2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    <LogOut size={13} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {pwModal && <PasswordModal onClose={() => setPwModal(false)} />}
    </>
  );
}
