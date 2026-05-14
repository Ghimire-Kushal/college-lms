import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Edit2, Save, X,
  KeyRound, Eye, EyeOff, BookOpen, UserCheck,
  GraduationCap, Clock, Award, Shield, AlertTriangle, CheckCircle,
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const roleColors = {
  admin:   { gradient: 'linear-gradient(135deg, #1E3535, #2a4a4a)', badge: '#1E3535' },
  teacher: { gradient: 'linear-gradient(135deg, #8B3030, #6b2525)', badge: '#8B3030' },
  student: { gradient: 'linear-gradient(135deg, #b87a00, #8a5a00)', badge: '#b87a00' },
};

export default function Profile() {
  const { user: authUser } = useAuth();
  const { dark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [stats, setStats]     = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw]   = useState({ cur: false, nw: false, cn: false });
  const [pwLoading, setPwLoading] = useState(false);

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#ede8e4';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';
  const inputStyle = { background: dark ? '#0f1e1e' : '#f8f5f3', borderColor: border, color: headClr };
  const rc = roleColors[authUser?.role] || roleColors.student;

  useEffect(() => {
    Promise.all([
      api.get('/auth/me'),
      authUser?.role === 'student' ? api.get('/student/dashboard')
        : authUser?.role === 'teacher' ? api.get('/teacher/dashboard')
        : api.get('/admin/dashboard'),
    ]).then(([userRes, statsRes]) => {
      setProfile(userRes.data);
      setStats(statsRes.data);
      setForm({ name: userRes.data.name, phone: userRes.data.phone || '', address: userRes.data.address || '' });
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await api.put('/auth/profile', form);
      setProfile(r.data);
      toast.success('Profile updated');
      setEditing(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Min 6 characters');
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setPwLoading(false); }
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: dark ? '#1a2828' : '#ede8e4' }} />
      ))}
    </div>
  );

  const attPct = stats?.attendancePercentage ? parseFloat(stats.attendancePercentage) : null;
  const courseColors = ['#8B3030','#1E3535','#b87a00','#2a6648'];

  // Stat cards config per role
  const statCards = authUser?.role === 'student' ? [
    { label: 'Courses',     value: stats?.totalCourses ?? 0,                  icon: BookOpen,    color: '#8B3030' },
    { label: 'Attendance',  value: `${attPct ?? 0}%`,                         icon: UserCheck,   color: attPct >= 75 ? '#059669' : '#8B3030' },
    { label: 'Present',     value: stats?.presentClasses ?? 0,                icon: CheckCircle, color: '#059669' },
    { label: 'Assignments', value: stats?.upcomingAssignments?.length ?? 0,   icon: Clock,       color: '#b87a00' },
  ] : authUser?.role === 'teacher' ? [
    { label: 'Courses',   value: stats?.totalCourses ?? 0,              icon: BookOpen,     color: '#8B3030' },
    { label: 'Students',  value: stats?.totalStudents ?? 0,             icon: GraduationCap, color: '#1E3535' },
    { label: 'Pending',   value: stats?.pendingSubmissions ?? 0,        icon: Clock,        color: '#b87a00' },
    { label: 'Recorded',  value: stats?.recentAttendance?.length ?? 0,  icon: Award,        color: '#2a6648' },
  ] : [
    { label: 'Students', value: stats?.totalStudents ?? 0, icon: GraduationCap, color: '#8B3030' },
    { label: 'Teachers', value: stats?.totalTeachers ?? 0, icon: User,          color: '#1E3535' },
    { label: 'Courses',  value: stats?.totalCourses  ?? 0, icon: BookOpen,      color: '#b87a00' },
    { label: 'Notices',  value: stats?.totalNotices  ?? 0, icon: Shield,        color: '#2a6648' },
  ];

  return (
    <div className="space-y-4">

      {/* ── Hero ── */}
      <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ background: cardBg, borderColor: border }}>
        {/* Cover strip */}
        <div className="h-24 relative" style={{ background: rc.gradient }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, #F2C04E 0%, transparent 70%)', opacity: 0.22 }} />
        </div>

        <div className="px-5 pb-5">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-7 mb-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-xl border-4"
              style={{ background: rc.gradient, borderColor: cardBg }}>
              {profile?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium border"
                    style={{ borderColor: border, color: subClr }}>
                    <X size={12} /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #1E3535, #2a4a4a)' }}>
                    <Save size={12} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border"
                  style={{ borderColor: border, color: headClr, background: dark ? '#1a2828' : '#f5faf7' }}>
                  <Edit2 size={12} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Name + badges */}
          {editing ? (
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="text-[18px] font-bold bg-transparent border-b-2 outline-none w-full mb-2"
              style={{ color: headClr, borderColor: rc.badge }} />
          ) : (
            <h2 className="text-[18px] font-bold mb-2" style={{ color: headClr }}>{profile?.name}</h2>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white"
              style={{ background: rc.badge }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              {profile?.role}
            </span>
            {profile?.studentId && <span className="text-[11px] px-2 py-0.5 rounded-full border" style={{ borderColor: border, color: subClr }}>ID: {profile.studentId}</span>}
            {profile?.teacherId && <span className="text-[11px] px-2 py-0.5 rounded-full border" style={{ borderColor: border, color: subClr }}>ID: {profile.teacherId}</span>}
            {profile?.semester  && <span className="text-[11px] px-2 py-0.5 rounded-full border" style={{ borderColor: border, color: subClr }}>Sem {profile.semester} · {profile.section}</span>}
            <span className="text-[11px] ml-auto" style={{ color: subClr }}>
              Since {new Date(profile?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stat chips ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4 border shadow-sm flex items-center gap-3"
            style={{ background: cardBg, borderColor: border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: dark ? '#0f1e1e' : '#f0f7f5' }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[18px] font-bold leading-none" style={{ color: headClr }}>{value}</p>
              <p className="text-[10px] mt-0.5 truncate" style={{ color: subClr }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Contact Info */}
        <div className="rounded-2xl border shadow-sm p-5" style={{ background: cardBg, borderColor: border }}>
          <h3 className="text-[13px] font-bold mb-4 flex items-center gap-2" style={{ color: headClr }}>
            <User size={14} style={{ color: rc.badge }} /> Contact Information
          </h3>
          <div className="space-y-4">
            {[
              { icon: Mail,   label: 'Email',   value: profile?.email,   field: null },
              { icon: Phone,  label: 'Phone',   value: profile?.phone,   field: 'phone',   ph: '+977 98xxxxxxxx' },
              { icon: MapPin, label: 'Address', value: profile?.address, field: 'address', ph: 'Your address...' },
            ].map(({ icon: Icon, label, value, field, ph }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: dark ? '#0f1e1e' : '#f5faf7' }}>
                  <Icon size={13} style={{ color: rc.badge }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: subClr }}>{label}</p>
                  {editing && field ? (
                    <input value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      className="w-full text-[13px] border-b outline-none bg-transparent pb-0.5"
                      style={{ color: headClr, borderColor: border }} placeholder={ph} />
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

        {/* Change Password */}
        <div className="rounded-2xl border shadow-sm p-5" style={{ background: cardBg, borderColor: border }}>
          <h3 className="text-[13px] font-bold mb-4 flex items-center gap-2" style={{ color: headClr }}>
            <KeyRound size={14} style={{ color: '#1E3535' }} /> Change Password
          </h3>
          <form onSubmit={handlePwChange} className="space-y-3">
            {[
              { key: 'currentPassword', label: 'Current Password', showKey: 'cur' },
              { key: 'newPassword',     label: 'New Password',     showKey: 'nw'  },
              { key: 'confirm',         label: 'Confirm Password', showKey: 'cn'  },
            ].map(({ key, label, showKey }) => (
              <div key={key}>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: subClr }}>{label}</label>
                <div className="relative">
                  <input type={showPw[showKey] ? 'text' : 'password'} required
                    value={pwForm[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-2 pr-9 rounded-xl text-[13px] border outline-none"
                    style={inputStyle} placeholder="••••••••" />
                  <button type="button"
                    onClick={() => setShowPw(p => ({ ...p, [showKey]: !p[showKey] }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                    style={{ color: subClr }}>
                    {showPw[showKey] ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={pwLoading}
              className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-60 hover:opacity-90 transition-all mt-1"
              style={{ background: 'linear-gradient(135deg, #8B3030, #6b2525)' }}>
              {pwLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Courses / detail section ── */}
      {authUser?.role === 'student' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Attendance bar */}
          {attPct !== null && (
            <div className="rounded-2xl border shadow-sm p-5" style={{ background: cardBg, borderColor: border }}>
              <h3 className="text-[13px] font-bold mb-4" style={{ color: headClr }}>Attendance Overview</h3>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span style={{ color: subClr }}>{stats?.presentClasses} present / {stats?.totalClasses} total</span>
                <span className="font-bold" style={{ color: attPct >= 75 ? '#059669' : '#8B3030' }}>{attPct}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: dark ? '#1a2828' : '#e8f5f0' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(attPct, 100)}%`, background: attPct >= 75 ? '#059669' : '#8B3030' }} />
              </div>
              {attPct < 75 && (
                <div className="flex items-center gap-2 mt-3 p-3 rounded-xl border"
                  style={{ background: dark ? '#2a1414' : '#fff0f0', borderColor: dark ? '#5a2020' : '#fca5a5' }}>
                  <AlertTriangle size={13} style={{ color: '#8B3030' }} />
                  <p className="text-[12px] font-medium" style={{ color: '#8B3030' }}>
                    Below 75% — please attend more classes.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Enrolled courses */}
          <div className="rounded-2xl border shadow-sm p-5" style={{ background: cardBg, borderColor: border }}>
            <h3 className="text-[13px] font-bold mb-3" style={{ color: headClr }}>Enrolled Courses</h3>
            <div className="space-y-2">
              {stats?.courses?.length === 0 && <p className="text-sm" style={{ color: subClr }}>No courses yet</p>}
              {stats?.courses?.map((c, i) => (
                <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: dark ? '#0f1e1e' : '#faf7f5', borderColor: border }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ background: courseColors[i % courseColors.length] }}>
                    {c.code?.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: headClr }}>{c.name}</p>
                    <p className="text-[11px]" style={{ color: subClr }}>{c.code}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {authUser?.role === 'teacher' && stats?.courses?.length > 0 && (
        <div className="rounded-2xl border shadow-sm p-5" style={{ background: cardBg, borderColor: border }}>
          <h3 className="text-[13px] font-bold mb-3" style={{ color: headClr }}>My Courses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stats.courses.map((c, i) => (
              <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ background: dark ? '#0f1e1e' : '#faf7f5', borderColor: border }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: courseColors[i % courseColors.length] }}>
                  {c.code?.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: headClr }}>{c.name}</p>
                  <p className="text-[11px]" style={{ color: subClr }}>{c.code}</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{ background: dark ? '#1a1414' : '#fef0f0', color: '#8B3030' }}>
                  {c.students?.length || 0} students
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
