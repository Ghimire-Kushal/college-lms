import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Sparkles, GraduationCap, BookOpen, Users, BarChart3 } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>
      {/* Left hero panel — hidden on mobile/tablet, visible on lg+ */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
          <div className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">EduTrack</p>
            <p className="text-indigo-300 text-xs font-medium">Learning Management System</p>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Empowering education<br />
              <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                through technology
              </span>
            </h1>
            <p className="text-slate-400 mt-3 text-[15px] leading-relaxed max-w-md">
              A unified platform for admins, teachers, and students to collaborate, track progress, and achieve academic excellence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-indigo-300" />
                </div>
                <div>
                  <p className="text-white text-[13px] font-semibold">{label}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom text */}
        <p className="relative text-slate-600 text-xs">© 2025 EduTrack LMS. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">EduTrack LMS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-11 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Quick access — demo accounts</p>
            <div className="space-y-2">
              {demo.map(({ role, email, pass, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => quickLogin(email, pass)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all hover:shadow-sm ${color}`}
                >
                  <div>
                    <p className="text-[13px] font-semibold">{role}</p>
                    <p className="text-[11px] opacity-75">{email}</p>
                  </div>
                  <span className="text-[11px] font-mono opacity-60">{pass}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
