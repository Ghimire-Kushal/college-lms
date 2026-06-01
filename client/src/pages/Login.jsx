import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const demo = [
  { role: 'Admin',   email: 'admin@edutrack.com',   pass: 'admin123' },
  { role: 'Teacher', email: 'teacher@edutrack.com', pass: 'teacher123' },
  { role: 'Student', email: 'student@edutrack.com', pass: 'student123' },
];

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email, pass) => setForm({ email, password: pass });

  const bg    = dark ? '#0f172a' : '#f9fafb';
  const cardBg = dark ? '#1e293b' : '#ffffff';
  const border = dark ? '#334155' : '#e5e7eb';
  const textPrimary = dark ? '#f1f5f9' : '#111827';
  const textMuted   = dark ? '#64748b' : '#9ca3af';
  const inputBg     = dark ? '#0f172a' : '#ffffff';
  const inputBorder = dark ? '#334155' : '#e5e7eb';

  return (
    <div
      className="min-h-screen flex"
      style={{ background: bg, transition: 'background 0.2s' }}
    >
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex lg:w-[44%] flex-col items-center justify-center px-12 py-12"
        style={{ background: dark ? '#020617' : '#111827', borderRight: `1px solid ${dark ? '#1e293b' : '#1f2937'}` }}
      >
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <img src="/logo.svg" alt="Apollo" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <p className="font-bold text-white text-[15px]">Apollo International</p>
              <p className="text-[11px] text-white/40">College · LMS</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-[32px] font-bold text-white leading-tight tracking-tight">
            Education<br />management<br />made simple.
          </h2>
          <p className="text-white/40 text-[14px] mt-4 leading-relaxed">
            A unified platform for students, teachers, and administrators to collaborate and track academic progress.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-3">
            {[
              'Student & teacher management',
              'Attendance tracking & reports',
              'Grade management & results',
              'Course materials & assignments',
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                <p className="text-white/50 text-[13px]">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="absolute top-5 right-5 w-8 h-8 rounded-md flex items-center justify-center transition-colors"
          style={{ background: dark ? '#1e293b' : '#f3f4f6', color: dark ? '#94a3b8' : '#6b7280' }}
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>

        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center"
              style={{ background: dark ? '#1e293b' : '#111827' }}>
              <img src="/logo.svg" alt="Apollo" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <p className="font-semibold text-[13px]" style={{ color: textPrimary }}>Apollo International College</p>
              <p className="text-[11px]" style={{ color: textMuted }}>Learning Management System</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-[24px] font-bold" style={{ color: textPrimary }}>Sign in</h1>
            <p className="text-[13px] mt-1" style={{ color: textMuted }}>Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: textMuted }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-[14px] focus:outline-none focus:ring-2 transition-shadow"
                style={{
                  background: inputBg,
                  border: `1px solid ${inputBorder}`,
                  color: textPrimary,
                  '--tw-ring-color': '#111827',
                }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wide" style={{ color: textMuted }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-[14px] focus:outline-none focus:ring-2 transition-shadow"
                  style={{
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: textPrimary,
                    '--tw-ring-color': '#111827',
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: textMuted }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-[14px] font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-colors hover:bg-[#1f2937]"
              style={{ background: '#111827', marginTop: 8 }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in...</> : 'Sign in'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px" style={{ background: border }} />
              <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: textMuted }}>
                Demo accounts
              </span>
              <div className="flex-1 h-px" style={{ background: border }} />
            </div>
            <div className="space-y-2">
              {demo.map(({ role, email, pass }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => quickLogin(email, pass)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-left transition-colors"
                  style={{ background: cardBg, borderColor: border }}
                  onMouseEnter={e => { e.currentTarget.style.background = dark ? '#0f172a' : '#f9fafb'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = cardBg; }}
                >
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: textPrimary }}>{role}</p>
                    <p className="text-[11px]" style={{ color: textMuted }}>{email}</p>
                  </div>
                  <span className="text-[11px] font-mono" style={{ color: textMuted }}>{pass}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
