import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const demo = [
  { role: 'Admin',   email: 'admin@edutrack.com',   pass: 'admin123'   },
  { role: 'Teacher', email: 'teacher@edutrack.com', pass: 'teacher123' },
  { role: 'Student', email: 'student@edutrack.com', pass: 'student123' },
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
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex">

        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between bg-blue-600 text-white p-10 w-2/5">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <img src="/logo.svg" alt="" className="w-6 h-6 brightness-0 invert" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Apollo International</p>
                <p className="text-blue-200 text-xs">College · LMS</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold leading-snug mb-3">
              Learning Management System
            </h1>
            <p className="text-blue-200 text-sm leading-relaxed">
              Manage students, teachers, courses, attendance, results, and more from one place.
            </p>
          </div>

          {/* Demo credentials */}
          <div>
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-3">Demo Accounts</p>
            <div className="space-y-2">
              {demo.map(d => (
                <button key={d.role} onClick={() => fill(d)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-left">
                  <div>
                    <p className="text-sm font-medium">{d.role}</p>
                    <p className="text-xs text-blue-200">{d.email}</p>
                  </div>
                  <span className="text-xs text-blue-200 font-mono">{d.pass}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-10">
          <div className="max-w-sm w-full mx-auto">
            <h2 className="text-xl font-semibold text-slate-800 mb-1">Sign in</h2>
            <p className="text-sm text-slate-500 mb-6">Enter your credentials to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-md text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full px-3 py-2.5 pr-9 rounded-md text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Mobile demo */}
            <div className="mt-6 md:hidden">
              <p className="text-xs font-medium text-slate-500 mb-2">Demo accounts:</p>
              <div className="flex gap-2 flex-wrap">
                {demo.map(d => (
                  <button key={d.role} onClick={() => fill(d)}
                    className="text-xs px-2.5 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 transition">
                    {d.role}
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
