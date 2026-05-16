import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Home, Menu, KeyRound, LogOut, User, X, Eye, EyeOff, CheckCheck, UserCheck, ClipboardList, BarChart2, Info } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const routeMeta = {
  '/admin':                { label: 'Dashboard',         section: 'Admin' },
  '/admin/students':       { label: 'Students',           section: 'Admin' },
  '/admin/teachers':       { label: 'Teachers',           section: 'Admin' },
  '/admin/courses':        { label: 'Courses',            section: 'Admin' },
  '/admin/timetable':      { label: 'Timetable',          section: 'Admin' },
  '/admin/attendance':     { label: 'Attendance Reports', section: 'Admin' },
  '/admin/notices':        { label: 'Notices',            section: 'Admin' },
  '/admin/results':        { label: 'Results',            section: 'Admin' },
  '/admin/feedback':       { label: 'Feedback',           section: 'Admin' },
  '/teacher':              { label: 'Dashboard',          section: 'Teacher' },
  '/teacher/courses':      { label: 'My Courses',         section: 'Teacher' },
  '/teacher/attendance':   { label: 'Attendance',         section: 'Teacher' },
  '/teacher/notes':        { label: 'Notes & Materials',  section: 'Teacher' },
  '/teacher/assignments':  { label: 'Assignments',        section: 'Teacher' },
  '/teacher/results':      { label: 'Results',            section: 'Teacher' },
  '/teacher/notices':      { label: 'Notices',            section: 'Teacher' },
  '/teacher/online-classes': { label: 'Online Classes',   section: 'Teacher' },
  '/teacher/profile':        { label: 'My Profile',        section: 'Teacher' },
  '/student':              { label: 'Dashboard',          section: 'Student' },
  '/student/courses':      { label: 'My Courses',         section: 'Student' },
  '/student/attendance':   { label: 'My Attendance',      section: 'Student' },
  '/student/notes':        { label: 'Notes & Materials',  section: 'Student' },
  '/student/assignments':  { label: 'Assignments',        section: 'Student' },
  '/student/results':      { label: 'My Results',         section: 'Student' },
  '/student/notices':      { label: 'Notices',            section: 'Student' },
  '/student/online-classes': { label: 'Online Classes',   section: 'Student' },
  '/student/profile':        { label: 'My Profile',        section: 'Student' },
  '/admin/profile':          { label: 'My Profile',        section: 'Admin'   },
};

const roleColors = {
  admin:   'from-[#1E3535] to-[#2a4a4a]',
  teacher: 'from-[#8B3030] to-[#6b2525]',
  student: 'from-[#b87a00] to-[#8a5a00]',
};

function PasswordModal({ onClose, dark }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [show, setShow] = useState({ cur: false, new: false, con: false });
  const [loading, setLoading] = useState(false);

  const borderColor = dark ? '#1e2e2e' : '#ede8e4';
  const inputStyle = {
    background: dark ? '#0f1e1e' : '#f8f5f3',
    borderColor,
    color: dark ? '#e2e8f0' : '#1e293b',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'currentPassword', label: 'Current Password', showKey: 'cur' },
    { key: 'newPassword',     label: 'New Password',     showKey: 'new' },
    { key: 'confirm',         label: 'Confirm New Password', showKey: 'con' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: dark ? '#131e1e' : '#ffffff', border: `1px solid ${borderColor}` }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: dark ? '#1a2828' : '#edf7f5' }}>
              <KeyRound size={16} style={{ color: '#1E3535' }} />
            </div>
            <div>
              <h3 className="font-bold text-[15px]" style={{ color: dark ? '#e2e8f0' : '#1e293b' }}>Change Password</h3>
              <p className="text-[11px]" style={{ color: dark ? '#6e7681' : '#64748b' }}>Update your account password</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:opacity-70"
            style={{ background: dark ? '#1e2e2e' : '#f0ebe8', color: dark ? '#6e7681' : '#64748b' }}>
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {fields.map(({ key, label, showKey }) => (
            <div key={key}>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: dark ? '#6e7681' : '#64748b' }}>{label}</label>
              <div className="relative">
                <input
                  type={show[showKey] ? 'text' : 'password'}
                  required
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-[14px] border outline-none transition-all"
                  style={inputStyle}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: dark ? '#6e7681' : '#94a3b8' }}>
                  {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[14px] font-medium border transition-all"
              style={{ borderColor, color: dark ? '#6e7681' : '#64748b', background: 'transparent' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #8B3030, #6b2525)', boxShadow: '0 4px 12px rgba(122,46,46,0.35)' }}>
              {loading ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const typeIcon = { attendance: UserCheck, assignment: ClipboardList, result: BarChart2, notice: Bell, general: Info };
const typeColor = { attendance: '#1E3535', assignment: '#8B3030', result: '#b87a00', notice: '#2a5080', general: '#64748b' };

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Navbar({ onMenuToggle, headerType = 'fixed' }) {
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen]     = useState(false);
  const [bellOpen, setBellOpen]     = useState(false);
  const [pwModal, setPwModal]       = useState(false);
  const [notifs, setNotifs]         = useState([]);
  const dropRef  = useRef(null);
  const bellRef  = useRef(null);
  const meta = routeMeta[pathname] || { label: 'Apollo International College', section: '' };
  const avatarGradient = roleColors[user?.role] || roleColors.student;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  const today = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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
      if (dropRef.current  && !dropRef.current.contains(e.target))  setDropOpen(false);
      if (bellRef.current  && !bellRef.current.contains(e.target))   setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navBg    = dark ? '#161b22' : '#ffffff';
  const navBorder = dark ? '#21262d' : '#e8edf3';

  return (
    <>
      <header
        className={`flex items-center justify-between px-4 sm:px-6 gap-3 border-b transition-colors duration-300${headerType === 'fixed' ? ' sticky top-0 z-20' : ''}`}
        style={{ height: 'var(--navbar-height)', minHeight: 'var(--navbar-height)', background: navBg, borderColor: navBorder, boxShadow: dark ? '0 1px 0 #21262d' : '0 1px 3px rgba(0,0,0,0.06)' }}>

        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onMenuToggle}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: dark ? '#8b949e' : '#64748b' }}>
            <Menu size={20} />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-sm min-w-0">
            <Home size={13} style={{ color: dark ? '#6e7681' : '#94a3b8' }} className="shrink-0" />
            <ChevronRight size={11} style={{ color: dark ? '#484f58' : '#cbd5e1' }} className="shrink-0" />
            <span className="hidden md:inline shrink-0" style={{ color: dark ? '#6e7681' : '#94a3b8' }}>{meta.section}</span>
            <ChevronRight size={11} style={{ color: dark ? '#484f58' : '#cbd5e1' }} className="shrink-0 hidden md:inline" />
            <span className="font-semibold truncate" style={{ color: dark ? '#c9d1d9' : '#334155' }}>{meta.label}</span>
          </div>
          <span className="sm:hidden font-bold text-[15px] truncate" style={{ color: dark ? '#e2e8f0' : '#1e293b' }}>{meta.label}</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden md:flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-full font-medium whitespace-nowrap"
            style={{ background: dark ? '#21262d' : '#f0f4f8', color: dark ? '#8b949e' : '#64748b', border: `1px solid ${dark ? '#30363d' : '#e2e8f0'}` }}>
            {today}
            <span className="font-mono font-semibold tabular-nums" style={{ color: dark ? '#c9d1d9' : '#334155' }}>{timeStr}</span>
          </span>

          {/* Bell / Notifications */}
          <div className="relative" ref={bellRef}>
            <button onClick={() => { setBellOpen(o => !o); setDropOpen(false); }}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: dark ? '#21262d' : '#f0f4f8', border: `1px solid ${dark ? '#30363d' : '#e2e8f0'}`, color: dark ? '#8b949e' : '#64748b' }}>
              <Bell size={16} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: '#dc2626' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl border overflow-hidden z-50"
                style={{ background: dark ? '#131e1e' : '#ffffff', borderColor: dark ? '#1e2e2e' : '#ede8e4' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: dark ? '#1e2e2e' : '#ede8e4' }}>
                  <div className="flex items-center gap-2">
                    <Bell size={14} style={{ color: '#1E3535' }} />
                    <span className="text-[13px] font-bold" style={{ color: dark ? '#e2e8f0' : '#1e293b' }}>
                      Notifications
                    </span>
                    {unread > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ background: '#dc2626' }}>{unread}</span>
                    )}
                  </div>
                  {unread > 0 && (
                    <button onClick={markAllRead}
                      className="flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-70"
                      style={{ color: '#1E3535' }}>
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifs.length === 0 && (
                    <div className="py-10 text-center">
                      <Bell size={24} className="mx-auto mb-2 opacity-20" style={{ color: dark ? '#6e7681' : '#94a3b8' }} />
                      <p className="text-[12px]" style={{ color: dark ? '#6e7681' : '#94a3b8' }}>No notifications yet</p>
                    </div>
                  )}
                  {notifs.map(n => {
                    const Icon = typeIcon[n.type] || Info;
                    const clr  = typeColor[n.type] || '#64748b';
                    return (
                      <div key={n._id}
                        onClick={() => markRead(n._id)}
                        className="flex gap-3 px-4 py-3 cursor-pointer border-b last:border-b-0 transition-colors"
                        style={{
                          borderColor: dark ? '#1e2e2e' : '#f0ebe8',
                          background: n.read ? 'transparent' : (dark ? 'rgba(30,53,53,0.2)' : 'rgba(30,53,53,0.04)'),
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.04)' : '#f8f5f3'}
                        onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : (dark ? 'rgba(30,53,53,0.2)' : 'rgba(30,53,53,0.04)')}>

                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: dark ? `${clr}22` : `${clr}15` }}>
                          <Icon size={14} style={{ color: clr }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[12px] font-semibold leading-snug" style={{ color: dark ? '#c9d1d9' : '#1e293b' }}>
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: dark ? '#6e7681' : '#64748b' }}>
                            {n.message}
                          </p>
                          <p className="text-[10px] mt-1 font-medium" style={{ color: dark ? '#484f58' : '#94a3b8' }}>
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

          <div className="w-px h-6 hidden sm:block" style={{ background: dark ? '#21262d' : '#e2e8f0' }} />

          {/* Avatar dropdown */}
          <div className="relative" ref={dropRef}>
            <button onClick={() => setDropOpen(o => !o)}
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-semibold leading-none" style={{ color: dark ? '#c9d1d9' : '#1e293b' }}>{user?.name}</p>
                <p className="text-[11px] mt-0.5 capitalize" style={{ color: dark ? '#6e7681' : '#94a3b8' }}>{user?.role}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0 overflow-hidden`}>
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  : user?.name?.[0]?.toUpperCase()}
              </div>
            </button>

            {dropOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl shadow-xl border overflow-hidden z-50"
                style={{ background: dark ? '#131e1e' : '#ffffff', borderColor: dark ? '#1e2e2e' : '#ede8e4' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: dark ? '#1e2e2e' : '#ede8e4' }}>
                  <p className="text-[13px] font-semibold truncate" style={{ color: dark ? '#e2e8f0' : '#1e293b' }}>{user?.name}</p>
                  <p className="text-[11px] truncate capitalize" style={{ color: dark ? '#6e7681' : '#64748b' }}>{user?.role}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { setDropOpen(false); navigate(`/${user?.role}/profile`); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors text-left"
                    style={{ color: dark ? '#c9d1d9' : '#374151' }}
                    onMouseEnter={e => e.currentTarget.style.background = dark ? '#1a2828' : '#f5faf7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <User size={14} style={{ color: '#8B3030' }} />
                    My Profile
                  </button>
                  <button onClick={() => { setDropOpen(false); setPwModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors text-left"
                    style={{ color: dark ? '#c9d1d9' : '#374151' }}
                    onMouseEnter={e => e.currentTarget.style.background = dark ? '#1a2828' : '#f5faf7'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <KeyRound size={14} style={{ color: '#1E3535' }} />
                    Change Password
                  </button>
                  <button onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors text-left"
                    style={{ color: dark ? '#f87171' : '#8B3030' }}
                    onMouseEnter={e => e.currentTarget.style.background = dark ? '#2a1414' : '#fff0f0'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {pwModal && <PasswordModal onClose={() => setPwModal(false)} dark={dark} />}
    </>
  );
}
