import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, GraduationCap, ClipboardCheck, BookOpen, Bell, TrendingUp } from 'lucide-react';

const demo = [
  { role: 'Admin',   email: 'admin@edutrack.com',   pass: 'admin123',   color: '#7c3aed', bg: '#f5f3ff' },
  { role: 'Teacher', email: 'teacher@edutrack.com', pass: 'teacher123', color: '#0284c7', bg: '#f0f9ff' },
  { role: 'Student', email: 'student@edutrack.com', pass: 'student123', color: '#059669', bg: '#f0fdf4' },
];

const floatingCards = [
  { icon: ClipboardCheck, label: 'Attendance Marked',  sub: 'DBMS301 • Just now',     color: '#2563eb', delay: '0s'    },
  { icon: TrendingUp,     label: 'Result Published',   sub: 'Web Tech • 89% avg',      color: '#059669', delay: '0.15s' },
  { icon: Bell,           label: 'Notice Posted',      sub: 'Exam schedule updated',   color: '#d97706', delay: '0.3s'  },
  { icon: BookOpen,       label: 'Assignment Due',     sub: 'DSA303 • Tomorrow',        color: '#7c3aed', delay: '0.45s' },
  { icon: GraduationCap,  label: 'Student Enrolled',   sub: 'Priya Shrestha • Sem 3',  color: '#0891b2', delay: '0.6s'  },
];

export default function Login() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [visible, setVisible]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .fade-up   { animation: fadeUp 0.5s ease both; }
        .card-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen flex overflow-hidden" style={{ background: '#f8fafc' }}>

        {/* ── LEFT: Branding ── */}
        <div
          className="hidden lg:flex flex-col w-[52%] relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 55%, #1d4ed8 100%)' }}
        >
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {/* Glow blobs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18), transparent 65%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 65%)', transform: 'translate(-30%, 30%)' }} />

          <div className="relative z-10 flex flex-col h-full px-12 py-10">

            {/* Logo */}
            <div className={`flex items-center gap-3 fade-up`} style={{ animationDelay: '0s' }}>
              <div className="w-10 h-10 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center">
                <img src="/logo.svg" alt="" className="w-6 h-6 brightness-0 invert" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Apollo International College</p>
                <p className="text-blue-300 text-[11px] tracking-wide">EduTrack LMS</p>
              </div>
            </div>

            {/* Headline */}
            <div className="mt-12 fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-300 bg-blue-500/20 border border-blue-400/20 px-3 py-1 rounded-full mb-5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Academic Management Platform
              </span>
              <h1 className="text-[34px] font-extrabold text-white leading-[1.2] tracking-tight">
                Everything you need<br />to run a modern<br />
                <span style={{
                  background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>college.</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed mt-4 max-w-xs">
                Students, teachers, courses, attendance, results — managed from one place.
              </p>
            </div>

            {/* Live activity feed */}
            <div className="mt-10 flex-1 flex flex-col justify-center fade-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Live Activity</p>
              <div className="space-y-2.5">
                {floatingCards.map(({ icon: Icon, label, sub, color, delay }, i) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 bg-white/6 backdrop-blur-sm border border-white/8 rounded-xl px-4 py-3 fade-up"
                    style={{ animationDelay: `${0.25 + i * 0.08}s`, animationFillMode: 'both' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[13px] font-semibold leading-tight">{label}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 truncate">{sub}</p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-8 fade-up" style={{ animationDelay: '0.6s' }}>
              {[['500+', 'Students'], ['40+', 'Courses'], ['95%', 'Attendance']].map(([v, l]) => (
                <div key={l} className="bg-white/6 border border-white/8 rounded-xl px-4 py-3 text-center">
                  <p className="text-white text-lg font-extrabold leading-none">{v}</p>
                  <p className="text-slate-500 text-[10px] mt-1 font-medium">{l}</p>
                </div>
              ))}
            </div>

            <p className="text-slate-700 text-[11px] mt-6 fade-up" style={{ animationDelay: '0.7s' }}>
              © 2026 Apollo International College
            </p>
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="flex-1 flex items-center justify-center bg-white px-8 sm:px-12 py-12">
          <div
            className="w-full max-w-[380px] fade-up"
            style={{ animationDelay: '0.1s', opacity: visible ? 1 : 0 }}
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                <img src="/logo.svg" alt="" className="w-5 h-5 brightness-0 invert" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Apollo International</p>
                <p className="text-slate-400 text-xs">EduTrack LMS</p>
              </div>
            </div>

            <h2 className="text-[26px] font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1 mb-7">Sign in to access your dashboard.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email address</label>
                <input
                  type="email" required autoComplete="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl text-sm border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
                  onFocus={e => e.target.style.background = '#fff'}
                  onBlur={e => e.target.style.background = '#f8fafc'}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
                    onFocus={e => e.target.style.background = '#fff'}
                    onBlur={e => e.target.style.background = '#f8fafc'}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                style={{
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                }}
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in...</> : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Demo Accounts</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Demo accounts */}
            <div className="space-y-2">
              {demo.map(d => (
                <button
                  key={d.role}
                  onClick={() => setForm({ email: d.email, password: d.pass })}
                  className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-left transition-all"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: d.color }}>
                    {d.role[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800">{d.role}</p>
                    <p className="text-[11px] text-slate-400 truncate">{d.email}</p>
                  </div>
                  <code className="text-[11px] font-mono text-slate-400 bg-slate-100 group-hover:bg-slate-200 px-2 py-1 rounded-md transition shrink-0">
                    {d.pass}
                  </code>
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
