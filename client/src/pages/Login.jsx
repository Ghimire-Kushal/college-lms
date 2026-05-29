import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, GraduationCap, ClipboardCheck, BookOpen, Bell, TrendingUp, CheckCircle } from 'lucide-react';

/* ── hooks ────────────────────────────────────────────── */
function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return t;
}

function useCountUp(target, duration = 1600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

/* ── data ─────────────────────────────────────────────── */
const ALL_ACTIVITIES = [
  { icon: ClipboardCheck, label: 'Attendance Marked',  sub: 'Physics Class 11 • Just now',       color: '#2563eb' },
  { icon: TrendingUp,     label: 'Result Published',   sub: 'Accountancy Class 12 • 91% avg',        color: '#059669' },
  { icon: Bell,           label: 'Notice Posted',      sub: 'Exam schedule updated',     color: '#d97706' },
  { icon: BookOpen,       label: 'Assignment Due',     sub: 'Mathematics Class 11 • Tomorrow',         color: '#7c3aed' },
  { icon: GraduationCap,  label: 'Student Enrolled',   sub: 'Priya Shrestha • Class 11',    color: '#0891b2' },
  { icon: CheckCircle,    label: 'Grade Released',     sub: 'Chemistry Class 12 • A grade',          color: '#8b5cf6' },
  { icon: Bell,           label: 'Fee Reminder',       sub: 'Due in 3 days',             color: '#ef4444' },
  { icon: ClipboardCheck, label: 'Class Scheduled',    sub: 'English Class 11 • 2:00 PM',     color: '#0f766e' },
];

const DEMO = [
  { role: 'Admin',   sub: 'Canvas Academy Udayapur', email: 'admin@edutrack.com',   pass: 'admin123',   color: '#7c3aed' },
  { role: 'Teacher', sub: 'Science Dept — Mr. Rajesh',    email: 'teacher@edutrack.com', pass: 'teacher123', color: '#0284c7' },
  { role: 'Student', sub: 'Class 11 · Science · Roll 001', email: 'student@edutrack.com', pass: 'student123', color: '#059669' },
];

/* ── component ────────────────────────────────────────── */
export default function Login() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [feed, setFeed]         = useState(ALL_ACTIVITIES.slice(0, 5));
  const [freshIdx, setFreshIdx] = useState(-1);
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const clock      = useClock();
  const students   = useCountUp(500);
  const courses    = useCountUp(40,  1400);
  const teachers   = useCountUp(28,  1200);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  /* auto-cycle activity feed every 2.8 s */
  useEffect(() => {
    let ptr = 5;
    const id = setInterval(() => {
      const next = ALL_ACTIVITIES[ptr % ALL_ACTIVITIES.length];
      ptr++;
      setFeed(prev => [next, ...prev.slice(0, 4)]);
      setFreshIdx(0);
      setTimeout(() => setFreshIdx(-1), 500);
    }, 2800);
    return () => clearInterval(id);
  }, []);

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

  const timeStr = clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = clock.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes gradMove {
          0%  { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100%{ background-position: 0% 50%; }
        }
        .fade-up  { animation: fadeUp  0.5s ease both; }
        .slide-in { animation: slideIn 0.38s ease both; }
        .grad-bg  {
          background: linear-gradient(-45deg,#0f172a,#1e3a5f,#1d4ed8,#1e40af);
          background-size: 400% 400%;
          animation: gradMove 10s ease infinite;
        }
      `}</style>

      <div className="min-h-screen flex overflow-hidden" style={{ background: '#f8fafc' }}>

        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden grad-bg">

          {/* dot grid */}
          <div className="absolute inset-0 opacity-[0.055]"
            style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {/* glow blobs */}
          <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(59,130,246,.22),transparent 65%)', transform: 'translate(30%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(99,102,241,.16),transparent 65%)', transform: 'translate(-30%,30%)' }} />

          <div className="relative z-10 flex flex-col h-full px-12 py-10">

            {/* logo + live clock */}
            <div className="flex items-start justify-between fade-up" style={{ animationDelay: '0s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center">
                  <img src="/logo.svg" alt="" className="w-6 h-6 brightness-0 invert" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">Canvas Academy Udayapur</p>
                  <p className="text-blue-300 text-[11px] tracking-wide">+2 Management LMS</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-mono text-xl font-bold tracking-wider tabular-nums">{timeStr}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{dateStr}</p>
              </div>
            </div>

            {/* headline */}
            <div className="mt-10 fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-300 bg-blue-500/20 border border-blue-400/20 px-3 py-1 rounded-full mb-5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Academic Management Platform
              </span>
              <h1 className="text-[34px] font-extrabold text-white leading-[1.2] tracking-tight">
                Everything you need<br />to run a modern<br />
                <span style={{ background: 'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  college.
                </span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed mt-4 max-w-xs">
                Students, teachers, courses, attendance, results — all managed from one place.
              </p>
            </div>

            {/* live activity feed */}
            <div className="mt-10 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4 fade-up" style={{ animationDelay: '0.2s' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Live Activity</p>
              </div>
              <div className="space-y-2.5">
                {feed.map(({ icon: Icon, label, sub, color }, i) => (
                  <div
                    key={`${label}-${i}`}
                    className={`flex items-center gap-3 backdrop-blur-sm border rounded-xl px-4 py-3 ${i === freshIdx ? 'slide-in' : 'fade-up'}`}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderColor: 'rgba(255,255,255,0.08)',
                      animationDelay: i === freshIdx ? '0s' : `${0.25 + i * 0.07}s`,
                      animationFillMode: 'both',
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[13px] font-semibold leading-tight">{label}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 truncate">{sub}</p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* animated stats */}
            <div className="grid grid-cols-3 gap-3 mt-8 fade-up" style={{ animationDelay: '0.6s' }}>
              {[[students, 'Students', '+'], [courses, 'Courses', '+'], [teachers, 'Teachers', '']].map(([v, l, s]) => (
                <div key={l} className="border rounded-xl px-4 py-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  <p className="text-white text-lg font-extrabold leading-none tabular-nums">{v}{s}</p>
                  <p className="text-slate-500 text-[10px] mt-1 font-medium">{l}</p>
                </div>
              ))}
            </div>

            <p className="text-slate-700 text-[11px] mt-6 fade-up" style={{ animationDelay: '0.7s' }}>
              © {new Date().getFullYear()} Canvas Academy Udayapur
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex items-center justify-center bg-white px-8 sm:px-12 py-12">
          <div
            className="w-full max-w-[380px]"
            style={{
              opacity:    mounted ? 1 : 0,
              transform:  mounted ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity .45s ease .1s, transform .45s ease .1s',
            }}
          >
            {/* mobile logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                <img src="/logo.svg" alt="" className="w-5 h-5 brightness-0 invert" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Canvas Academy</p>
                <p className="text-slate-400 text-xs">+2 Management LMS</p>
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
                  onBlur={e  => e.target.style.background = '#f8fafc'}
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
                    onBlur={e  => e.target.style.background = '#f8fafc'}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-60 active:scale-[.98] flex items-center justify-center gap-2 mt-1"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', boxShadow: '0 4px 14px rgba(37,99,235,.35)' }}
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Demo Accounts</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="space-y-2">
              {DEMO.map(d => (
                <button
                  key={d.role}
                  onClick={() => setForm({ email: d.email, password: d.pass })}
                  className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-left transition-all active:scale-[.99]"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: d.color }}>
                    {d.role[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800">{d.role}</p>
                    <p className="text-[11px] text-slate-400 truncate">{d.sub}</p>
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
