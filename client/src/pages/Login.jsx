import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, GraduationCap, BookOpen, Users, BarChart3 } from 'lucide-react';

const features = [
  { icon: GraduationCap, label: 'Student Management', desc: 'Enroll & track every student' },
  { icon: BookOpen,      label: 'Course Management',  desc: 'Organize courses & materials' },
  { icon: Users,         label: 'Teacher Portal',     desc: 'Attendance & grading tools' },
  { icon: BarChart3,     label: 'Analytics & Reports',desc: 'Real-time academic insights' },
];

const demo = [
  { role: 'Admin',   email: 'admin@edutrack.com',   pass: 'admin123',   color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { role: 'Teacher', email: 'teacher@edutrack.com', pass: 'teacher123', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { role: 'Student', email: 'student@edutrack.com', pass: 'student123', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
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

  const panelBg = dark ? '#0d1117' : '#f1f5f9';
  const cardBg  = dark ? '#161b22' : '#ffffff';
  const cardBorder = dark ? '#30363d' : '#e2e8f0';
  const labelColor = dark ? '#94a3b8' : '#374151';
  const headingColor = dark ? '#f1f5f9' : '#1e293b';
  const subColor = dark ? '#64748b' : '#64748b';
  const inputBg = dark ? '#0d1117' : '#ffffff';
  const inputBorder = dark ? '#30363d' : '#e2e8f0';
  const inputText = dark ? '#e2e8f0' : '#1e293b';

  return (
    <div className="min-h-screen flex" style={{ background: panelBg, transition: 'background 0.3s' }}>
      {/* Left hero panel — hidden on mobile/tablet, visible on lg+ */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col items-center justify-center px-14 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #080f0f 0%, #0f1e1e 45%, #162828 100%)' }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #F2C04E, transparent)', transform: 'translate(30%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, #8B3030, transparent)', transform: 'translate(-30%,30%)' }} />
        </div>

        {/* Centered brand + content */}
        <div className="relative w-full max-w-lg text-center space-y-10">

          {/* Logo + College name */}
          <div className="flex flex-col items-center gap-5">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl bg-white flex items-center justify-center"
              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 24px 48px rgba(0,0,0,0.5)' }}>
              <img src="/logo.svg" alt="Apollo International College" className="w-full h-full object-contain p-2" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
                Apollo International College
              </h1>
              <p className="text-sky-400 text-sm font-medium mt-1.5 tracking-wide">
                Learning Management System
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.5)' }}>
              Empowering Education
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 text-left">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(59,130,246,0.18)' }}>
                  <Icon size={16} className="text-blue-300" />
                </div>
                <div>
                  <p className="text-white text-[13px] font-semibold">{label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <p className="absolute bottom-6 text-[11px]" style={{ color: 'rgba(100,116,139,0.7)' }}>
          © 2025 Apollo International College. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-8 relative" style={{ background: panelBg, transition: 'background 0.3s' }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: dark ? '#21262d' : '#e2e8f0', color: dark ? '#f59e0b' : '#64748b' }}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark
            ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><style>{`path,circle{stroke:currentColor;stroke-width:2;stroke-linecap:round;fill:none;} circle{fill:currentColor;}`}</style></svg>
            : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          }
        </button>

        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center border border-slate-200">
              <img src="/logo.svg" alt="Apollo" className="w-full h-full object-contain p-0.5" />
            </div>
            <div>
              <p className="font-bold text-[15px] leading-tight" style={{ color: headingColor }}>Apollo International College</p>
              <p className="text-[11px]" style={{ color: subColor }}>Learning Management System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: headingColor }}>Welcome back</h2>
            <p className="text-sm mt-1" style={{ color: subColor }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: labelColor }}>Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputText }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: labelColor }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputText }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: subColor }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #8B3030, #6b2525)', boxShadow: '0 4px 14px rgba(122,46,46,0.45)' }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: subColor }}>Quick access — demo accounts</p>
            <div className="space-y-2">
              {demo.map(({ role, email, pass }) => {
                const demoColors = {
                  Admin:   { bg: dark ? '#1e1b2e' : '#f3f0ff', border: dark ? '#4c1d95' : '#ddd6fe', text: dark ? '#a78bfa' : '#6d28d9' },
                  Teacher: { bg: dark ? '#0c2340' : '#eff6ff', border: dark ? '#1e40af' : '#bfdbfe', text: dark ? '#60a5fa' : '#1d4ed8' },
                  Student: { bg: dark ? '#052e16' : '#f0fdf4', border: dark ? '#14532d' : '#bbf7d0', text: dark ? '#4ade80' : '#15803d' },
                }[role];
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => quickLogin(email, pass)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all hover:shadow-sm"
                    style={{ background: demoColors.bg, borderColor: demoColors.border, color: demoColors.text }}
                  >
                    <div>
                      <p className="text-[13px] font-semibold">{role}</p>
                      <p className="text-[11px] opacity-75">{email}</p>
                    </div>
                    <span className="text-[11px] font-mono opacity-60">{pass}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
