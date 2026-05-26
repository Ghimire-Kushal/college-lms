import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, KeyRound, LogOut, User, X, Eye, EyeOff, CheckCheck, UserCheck, ClipboardList, BarChart2, Info } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const routeLabels = {
  '/admin': 'Dashboard', '/admin/students': 'Students', '/admin/teachers': 'Teachers',
  '/admin/courses': 'Courses', '/admin/timetable': 'Timetable', '/admin/attendance': 'Attendance',
  '/admin/notices': 'Notices', '/admin/results': 'Results', '/admin/feedback': 'Feedback',
  '/teacher': 'Dashboard', '/teacher/courses': 'My Courses', '/teacher/attendance': 'Attendance',
  '/teacher/notes': 'Notes', '/teacher/assignments': 'Assignments', '/teacher/results': 'Results',
  '/teacher/notices': 'Notices', '/teacher/online-classes': 'Online Classes',
  '/student': 'Dashboard', '/student/courses': 'My Courses', '/student/timetable': 'Class Routine',
  '/student/attendance': 'Attendance', '/student/notes': 'Notes', '/student/assignments': 'Assignments',
  '/student/results': 'Results', '/student/progress': 'Progress', '/student/online-classes': 'Online Classes',
  '/student/library': 'Library', '/student/fees': 'Fee Details', '/student/notices': 'Notices',
  '/student/feedback': 'Feedback',
};

const typeIcon  = { attendance: UserCheck, assignment: ClipboardList, result: BarChart2, notice: Bell, general: Info };
const typeColor = { attendance: '#059669', assignment: '#2563eb', result: '#d97706', notice: '#7c3aed', general: '#64748b' };

function timeAgo(date) {
  const s = (Date.now() - new Date(date)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function PasswordModal({ onClose }) {
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [show, setShow]     = useState({ cur: false, new: false, con: false });
  const [loading, setLoading] = useState(false);
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    if (form.newPassword.length < 6) return toast.error('Minimum 6 characters');
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-blue-600" />
            <h3 className="font-semibold text-slate-800">Change Password</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {[
            { key: 'currentPassword', label: 'Current Password', showKey: 'cur' },
            { key: 'newPassword',     label: 'New Password',     showKey: 'new' },
            { key: 'confirm',         label: 'Confirm Password', showKey: 'con' },
          ].map(({ key, label, showKey }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <div className="relative">
                <input
                  type={show[showKey] ? 'text' : 'password'}
                  required
                  value={form[key]}
                  onChange={f(key)}
                  className="w-full px-3 py-2 pr-9 rounded-md text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-md text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  const navigate         = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [pwModal, setPwModal]   = useState(false);
  const [notifs, setNotifs]     = useState([]);
  const dropRef = useRef(null);
  const bellRef = useRef(null);

  const label  = routeLabels[pathname] || 'Apollo LMS';
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
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 gap-3 bg-white border-b border-slate-200"
        style={{ height: 'var(--navbar-height)', minHeight: 'var(--navbar-height)' }}>

        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100">
            <Menu size={18} />
          </button>
          <h2 className="font-semibold text-slate-800 text-sm truncate">{label}</h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Bell */}
          <div className="relative" ref={bellRef}>
            <button onClick={() => { setBellOpen(o => !o); setDropOpen(false); }}
              className="relative p-2 rounded-md text-slate-500 hover:bg-slate-100 transition">
              <Bell size={17} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-800">
                    Notifications {unread > 0 && <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{unread}</span>}
                  </span>
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifs.length === 0 && (
                    <p className="text-center text-sm text-slate-400 py-8">No notifications</p>
                  )}
                  {notifs.map(n => {
                    const Icon = typeIcon[n.type] || Info;
                    const clr  = typeColor[n.type] || '#64748b';
                    return (
                      <div key={n._id} onClick={() => markRead(n._id)}
                        className={`flex gap-3 px-4 py-3 cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50 transition ${!n.read ? 'bg-blue-50/50' : ''}`}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${clr}18` }}>
                          <Icon size={13} style={{ color: clr }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 leading-tight">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={dropRef}>
            <button onClick={() => setDropOpen(o => !o)}
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 transition">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden shrink-0">
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  : user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">{user?.name}</span>
            </button>

            {dropOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 capitalize">{user?.role}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { setDropOpen(false); navigate(`/${user?.role}/profile`); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left">
                    <User size={13} className="text-slate-400" /> Profile
                  </button>
                  <button onClick={() => { setDropOpen(false); setPwModal(true); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left">
                    <KeyRound size={13} className="text-slate-400" /> Change Password
                  </button>
                  <button onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left">
                    <LogOut size={13} /> Sign Out
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
