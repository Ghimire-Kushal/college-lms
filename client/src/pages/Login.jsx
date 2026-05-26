import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, GraduationCap, BookOpen, Users, BarChart3 } from 'lucide-react';

const demo = [
  { role: 'Admin',   email: 'admin@edutrack.com',   pass: 'admin123',   color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { role: 'Teacher', email: 'teacher@edutrack.com', pass: 'teacher123', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { role: 'Student', email: 'student@edutrack.com', pass: 'student123', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

const features = [
  { icon: GraduationCap, label: 'Student Management', desc: 'Enroll and track every student' },
  { icon: BookOpen,      label: 'Course Management',  desc: 'Organize courses and materials' },
  { icon: Users,         label: 'Teacher Portal',     desc: 'Attendance and grading tools' },
  { icon: BarChart3,     label: 'Analytics',          desc: 'Real-time academic insights' },
];

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome, ${user.name}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const fill = (d) => setForm({ email: d.email, password: d.pass });

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* ── Left: Branding ── */}
        <div className="hidden md:flex flex-col w-2/5 bg-blue-600 p-10 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <img src="/logo.svg" alt="" className="w-6 h-6 brightness-0 invert" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Apollo International</p>
              <p className="text-blue-200 text-xs">Learning Management System</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold leading-snug mb-3">
              Everything your college needs, in one place.
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed mb-8">
              Manage students, teachers, courses, attendance, results and more.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-blue-200">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-blue-300 mt-8">Apollo International College · EduTrack LMS</p>
        </div>

        {/* ── Right: Form ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 sm:px-12">
          <div className="max-w-sm w-full mx-auto">

            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-6 md:hidden">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <img src="/logo.svg" alt="" className="w-5 h-5 brightness-0 invert" />
              </div>
              <span className="font-bold text-slate-800 text-sm">Apollo LMS</span>
            </div>

            <h1 className="text-xl font-semibold text-slate-800 mb-1">Sign in to your account</h1>
            <p className="text-sm text-slate-500 mb-7">Enter your email and password to continue.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition mt-1"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-7 pt-6 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-500 mb-3">Try a demo account — click to fill in:</p>
              <div className="space-y-2">
                {demo.map(d => (
                  <button
                    key={d.role}
                    onClick={() => fill(d)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-left text-sm transition hover:opacity-80 ${d.color}`}
                  >
                    <div>
                      <span className="font-semibold text-xs uppercase tracking-wide">{d.role}</span>
                      <p className="text-xs opacity-75 mt-0.5">{d.email}</p>
                    </div>
                    <code className="text-xs font-mono opacity-60">{d.pass}</code>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
