import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)' }} />
        <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider">Teacher Portal</p>
        <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">Hello, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-violet-200/70 text-sm mt-1">Canvas Academy Udayapur</p>
      </div>
    </div>
  );
}
