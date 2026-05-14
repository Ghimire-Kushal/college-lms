import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Shield, BookOpen, UserCheck,
  Edit2, Save, X, KeyRound, Eye, EyeOff, Camera, GraduationCap,
  CalendarDays, Award, Clock, CheckCircle, AlertTriangle, Video,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const roleColors = {
  admin:   { gradient: 'linear-gradient(135deg, #1E3535, #2a4a4a)', badge: '#1E3535', light: '#edf7f5' },
  teacher: { gradient: 'linear-gradient(135deg, #8B3030, #6b2525)', badge: '#8B3030', light: '#fef0f0' },
  student: { gradient: 'linear-gradient(135deg, #b87a00, #8a5a00)', badge: '#b87a00', light: '#fef9ec' },
};

function PasswordSection({ dark, border, headClr, subClr, cardBg }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [show, setShow] = useState({ cur: false, new: false, con: false });
  const [loading, setLoading] = useState(false);

  const inputStyle = { background: dark ? '#0f1e1e' : '#f8f5f3', borderColor: border, color: dark ? '#e2e8f0' : '#1e293b' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    if (form.newPassword.length < 6) return toast.error('Min 6 characters');
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated successfully');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'currentPassword', label: 'Current Password', showKey: 'cur' },
    { key: 'newPassword',     label: 'New Password',     showKey: 'new' },
    { key: 'confirm',         label: 'Confirm Password', showKey: 'con' },
  ];

  return (
    <div className="rounded-2xl border shadow-sm p-5" style={{ background: cardBg, borderColor: border }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: dark ? '#1a2828' : '#edf7f5' }}>
          <KeyRound size={16} style={{ color: '#1E3535' }} />
        </div>
        <div>
          <h3 className="text-[14px] font-bold" style={{ color: headClr }}>Change Password</h3>
          <p className="text-[11px]" style={{ color: subClr }}>Update your account password</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map(({ key, label, showKey }) => (
          <div key={key}>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: subClr }}>{label}</label>
            <div className="relative">
              <input type={show[showKey] ? 'text' : 'password'} required value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 pr-10 rounded-xl text-[13px] border outline-none transition-all"
                style={inputStyle} placeholder="••••••••" />
              <button type="button" onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
                style={{ color: subClr }}>
                {show[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        ))}
        <button type="submit" disabled={loading}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white mt-1 transition-all disabled:opacity-60 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #8B3030, #6b2525)' }}>
          {loading ? 'Saving…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

export default function Profile() {
  const { user: authUser, setUser } = useAuth();
  const { dark } = useTheme();
  const [profile, setProfile]     = useState(null);
  const [stats, setStats]         = useState(null);
  const [editing, setEditing]     = useState(false);
  const [form, setForm]           = useState({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#ede8e4';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';
  const rc      = roleColors[authUser?.role] || roleColors.student;

  useEffect(() => {
    Promise.all([
      api.get('/auth/me'),
      loadStats(),
    ]).then(([r]) => {
      setProfile(r.data);
      setForm({ name: r.data.name, phone: r.data.phone || '', address: r.data.address || '' });
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  async function loadStats() {
    try {
      if (authUser?.role === 'student') {
        const r = await api.get('/student/dashboard');
        setStats(r.data);
      } else if (authUser?.role === 'teacher') {
        const r = await api.get('/teacher/dashboard');
        setStats(r.data);
      } else {
        const r = await api.get('/admin/dashboard');
        setStats(r.data);
      }
    } catch {}
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await api.put('/auth/profile', form);
      setProfile(r.data);
      if (setUser) setUser(prev => ({ ...prev, name: r.data.name }));
      toast.success('Profile updated');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="space-y-5">
      <div className="h-48 rounded-2xl animate-pulse" style={{ background: dark ? '#1a2828' : '#f0ebe8' }} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-64 rounded-2xl animate-pulse" style={{ background: dark ? '#1a2828' : '#f0ebe8' }} />
        <div className="lg:col-span-2 h-64 rounded-2xl animate-pulse" style={{ background: dark ? '#1a2828' : '#f0ebe8' }} />
      </div>
    </div>
  );

  const attPct = stats?.attendancePercentage ? parseFloat(stats.attendancePercentage) : null;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Hero card */}
      <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ background: cardBg, borderColor: border }}>
        {/* Cover */}
        <div className="h-28 relative" style={{ background: rc.gradient }}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, #F2C04E 0%, transparent 70%)', opacity: 0.2 }} />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        {/* Info row */}
        <div className="px-6 pb-5 relative">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl border-4"
                style={{ background: rc.gradient, borderColor: cardBg }}>
                {profile?.name?.[0]?.toUpperCase()}
              </div>
            </div>
            <div className="flex gap-2 mb-1">
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium border transition-all"
                    style={{ borderColor: border, color: subClr }}>
                    <X size={13} /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white transition-all disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #1E3535, #2a4a4a)' }}>
                    <Save size={13} /> {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all hover:opacity-80"
                  style={{ borderColor: border, color: headClr, background: dark ? '#1a2828' : '#f5faf7' }}>
                  <Edit2 size={13} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              {editing ? (
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="text-[20px] font-bold border-b-2 outline-none bg-transparent mb-1 w-full"
                  style={{ color: headClr, borderColor: rc.badge }} />
              ) : (
                <h2 className="text-[20px] font-bold" style={{ color: headClr }}>{profile?.name}</h2>
              )}
              <div className="flex items-center gap-2 flex-wrap mt-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full text-white"
                  style={{ background: rc.badge }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  {profile?.role}
                </span>
                {profile?.studentId && (
                  <span className="text-[12px] px-2.5 py-0.5 rounded-full border font-medium"
                    style={{ borderColor: border, color: subClr }}>ID: {profile.studentId}</span>
                )}
                {profile?.teacherId && (
                  <span className="text-[12px] px-2.5 py-0.5 rounded-full border font-medium"
                    style={{ borderColor: border, color: subClr }}>ID: {profile.teacherId}</span>
                )}
                {profile?.semester && (
                  <span className="text-[12px] px-2.5 py-0.5 rounded-full border font-medium"
                    style={{ borderColor: border, color: subClr }}>Sem {profile.semester} · {profile.section}</span>
                )}
              </div>
            </div>
            <p className="text-[11px]" style={{ color: subClr }}>
              Member since {new Date(profile?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Contact info */}
          <div className="rounded-2xl border shadow-sm p-5" style={{ background: cardBg, borderColor: border }}>
            <h3 className="text-[13px] font-bold mb-4 flex items-center gap-2" style={{ color: headClr }}>
              <User size={14} style={{ color: rc.badge }} /> Contact Information
            </h3>
            <div className="space-y-3">
              {[
                { icon: Mail,   label: 'Email',   value: profile?.email,   field: null },
                { icon: Phone,  label: 'Phone',   value: profile?.phone,   field: 'phone',   placeholder: '+977 98xxxxxxxx' },
                { icon: MapPin, label: 'Address', value: profile?.address, field: 'address', placeholder: 'Your address...' },
              ].map(({ icon: Icon, label, value, field, placeholder }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: dark ? '#0f1e1e' : '#f5faf7' }}>
                    <Icon size={13} style={{ color: rc.badge }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: subClr }}>{label}</p>
                    {editing && field ? (
                      <input value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                        className="w-full text-[13px] border-b outline-none bg-transparent pb-0.5"
                        style={{ color: headClr, borderColor: border }}
                        placeholder={placeholder} />
                    ) : (
                      <p className="text-[13px] truncate" style={{ color: value ? headClr : subClr }}>
                        {value || (field ? 'Not set' : '—')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Password */}
          <PasswordSection dark={dark} border={border} headClr={headClr} subClr={subClr} cardBg={cardBg} />
        </div>

        {/* Right column: Stats */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats grid */}
          {authUser?.role === 'student' && stats && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Enrolled Courses', value: stats.totalCourses ?? 0, icon: BookOpen, color: '#8B3030', bg: '#fef0f0' },
                  { label: 'Attendance Rate',  value: `${attPct ?? 0}%`,       icon: UserCheck, color: attPct >= 75 ? '#059669' : '#8B3030', bg: attPct >= 75 ? '#f0fdf4' : '#fef0f0' },
                  { label: 'Present Classes',  value: stats.presentClasses ?? 0, icon: CheckCircle, color: '#059669', bg: '#f0fdf4' },
                  { label: 'Due Assignments',  value: stats.upcomingAssignments?.length ?? 0, icon: CalendarDays, color: '#b87a00', bg: '#fef9ec' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="rounded-2xl p-4 border shadow-sm text-center" style={{ background: cardBg, borderColor: border }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                      style={{ background: dark ? '#0f1e1e' : bg }}>
                      <Icon size={16} style={{ color: dark ? color : color }} />
                    </div>
                    <p className="text-[18px] font-bold" style={{ color: headClr }}>{value}</p>
                    <p className="text-[10px] font-medium mt-0.5" style={{ color: subClr }}>{label}</p>
                  </div>
                ))}
              </div>

              {attPct !== null && (
                <div className="rounded-2xl p-5 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
                  <h3 className="text-[13px] font-bold mb-3" style={{ color: headClr }}>Attendance Overview</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-[12px] mb-1.5">
                        <span style={{ color: subClr }}>Present / Total</span>
                        <span className="font-bold" style={{ color: attPct >= 75 ? '#059669' : '#8B3030' }}>{attPct}%</span>
                      </div>
                      <div className="h-3 rounded-full overflow-hidden" style={{ background: dark ? '#1a2828' : '#e8f5f0' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(attPct, 100)}%`, background: attPct >= 75 ? '#059669' : '#8B3030' }} />
                      </div>
                      <div className="flex justify-between text-[10px] mt-1.5" style={{ color: subClr }}>
                        <span>{stats.presentClasses} present</span>
                        <span>{(stats.totalClasses ?? 0) - (stats.presentClasses ?? 0)} absent</span>
                        <span>{stats.totalClasses} total</span>
                      </div>
                    </div>
                  </div>
                  {attPct < 75 && (
                    <div className="flex items-center gap-2 mt-3 p-3 rounded-xl border"
                      style={{ background: dark ? '#2a1414' : '#fff0f0', borderColor: dark ? '#5a2020' : '#fca5a5' }}>
                      <AlertTriangle size={14} style={{ color: '#8B3030' }} />
                      <p className="text-[12px] font-medium" style={{ color: '#8B3030' }}>
                        Attendance below 75% — please attend more classes.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Enrolled courses */}
              {stats.courses?.length > 0 && (
                <div className="rounded-2xl p-5 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
                  <h3 className="text-[13px] font-bold mb-3" style={{ color: headClr }}>Enrolled Courses</h3>
                  <div className="space-y-2">
                    {stats.courses.map((c, i) => {
                      const colors = ['#8B3030','#1E3535','#b87a00','#2a6648'];
                      return (
                        <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl border"
                          style={{ background: dark ? '#0f1e1e' : '#faf7f5', borderColor: border }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: colors[i % colors.length] }}>
                            {c.code?.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold" style={{ color: headClr }}>{c.name}</p>
                            <p className="text-[11px]" style={{ color: subClr }}>{c.code}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {authUser?.role === 'teacher' && stats && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'My Courses',       value: stats.totalCourses ?? 0,       icon: BookOpen,    color: '#8B3030', bg: '#fef0f0' },
                  { label: 'Total Students',   value: stats.totalStudents ?? 0,      icon: GraduationCap, color: '#1E3535', bg: '#edf7f5' },
                  { label: 'Pending Reviews',  value: stats.pendingSubmissions ?? 0, icon: Clock,       color: '#b87a00', bg: '#fef9ec' },
                  { label: 'Classes Recorded', value: stats.recentAttendance?.length ?? 0, icon: Award, color: '#2a6648', bg: '#f0fdf4' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="rounded-2xl p-4 border shadow-sm text-center" style={{ background: cardBg, borderColor: border }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                      style={{ background: dark ? '#0f1e1e' : bg }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <p className="text-[18px] font-bold" style={{ color: headClr }}>{value}</p>
                    <p className="text-[10px] font-medium mt-0.5" style={{ color: subClr }}>{label}</p>
                  </div>
                ))}
              </div>

              {stats.courses?.length > 0 && (
                <div className="rounded-2xl p-5 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
                  <h3 className="text-[13px] font-bold mb-3" style={{ color: headClr }}>My Courses</h3>
                  <div className="space-y-2">
                    {stats.courses.map((c, i) => {
                      const colors = ['#8B3030','#1E3535','#b87a00','#2a6648'];
                      return (
                        <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl border"
                          style={{ background: dark ? '#0f1e1e' : '#faf7f5', borderColor: border }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: colors[i % colors.length] }}>
                            {c.code?.slice(0, 2)}
                          </div>
                          <div className="flex-1">
                            <p className="text-[13px] font-semibold" style={{ color: headClr }}>{c.name}</p>
                            <p className="text-[11px]" style={{ color: subClr }}>{c.code}</p>
                          </div>
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: dark ? '#1a1414' : '#fef0f0', color: '#8B3030' }}>
                            {c.students?.length || 0} students
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {authUser?.role === 'admin' && stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Students', value: stats.totalStudents ?? 0, icon: GraduationCap, color: '#8B3030', bg: '#fef0f0' },
                { label: 'Total Teachers', value: stats.totalTeachers ?? 0, icon: User,          color: '#1E3535', bg: '#edf7f5' },
                { label: 'Active Courses', value: stats.totalCourses  ?? 0, icon: BookOpen,      color: '#b87a00', bg: '#fef9ec' },
                { label: 'Notices Posted', value: stats.totalNotices  ?? 0, icon: Shield,        color: '#2a6648', bg: '#f0fdf4' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="rounded-2xl p-4 border shadow-sm text-center" style={{ background: cardBg, borderColor: border }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: dark ? '#0f1e1e' : bg }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <p className="text-[18px] font-bold" style={{ color: headClr }}>{value}</p>
                  <p className="text-[10px] font-medium mt-0.5" style={{ color: subClr }}>{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
