import { CreditCard, AlertCircle, Clock, CheckCircle, DollarSign, FileText } from 'lucide-react';
import { PageHeader } from '../../components/UI';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const feeStructure = [
  { label: 'Tuition Fee', amount: 'As per semester', period: 'Per Semester', color: '#8B3030' },
  { label: 'Exam Fee', amount: 'As per exam', period: 'Per Exam', color: '#1E3535' },
  { label: 'Library Fee', amount: 'Annual', period: 'Per Year', color: '#b87a00' },
  { label: 'Sports & Activities', amount: 'Annual', period: 'Per Year', color: '#2a6648' },
  { label: 'Lab / Practical Fee', amount: 'As applicable', period: 'Per Semester', color: '#4338ca' },
  { label: 'Administration Fee', amount: 'Annual', period: 'Per Year', color: '#0369a1' },
];

const paymentMethods = [
  { name: 'Bank Transfer', detail: 'Apollo International College Account', icon: '🏦' },
  { name: 'Cash Payment', detail: 'Admin Office · Mon–Fri 10am–4pm', icon: '💵' },
  { name: 'eSewa / Khalti', detail: 'Digital payment coming soon', icon: '📱' },
];

export default function StudentFees() {
  const { dark } = useTheme();
  const { user } = useAuth();

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#e8edf3';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';
  const rowBg   = dark ? '#1a2828' : '#f8fafc';

  return (
    <div className="space-y-5">
      <PageHeader title="Fee Details" subtitle="Fee structure and payment information for your academic program." />

      {/* Coming Soon Banner */}
      <div className="rounded-2xl p-5 border relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #b87a00 0%, #8B3030 100%)', borderColor: 'transparent' }}>
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Clock size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-[16px]">Online Payment Portal Coming Soon</p>
            <p className="text-white/75 text-[13px] mt-1 leading-relaxed">
              Full fee management, payment history, and online payment will be available in a future update.
              For now, please visit the Admin Office for fee-related transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Student Info */}
      <div className="rounded-2xl p-5 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
        <h2 className="text-[14px] font-bold mb-4" style={{ color: headClr }}>Your Academic Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Student Name', value: user?.name },
            { label: 'Student ID', value: user?.studentId || 'N/A' },
            { label: 'Current Semester', value: user?.semester ? `Semester ${user.semester}` : 'N/A' },
            { label: 'Section', value: user?.section || 'N/A' },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-xl" style={{ background: rowBg }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: subClr }}>{item.label}</p>
              <p className="text-[13px] font-semibold mt-1" style={{ color: headClr }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fee Structure */}
        <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: border }}>
            <div className="flex items-center gap-2">
              <FileText size={16} style={{ color: '#8B3030' }} />
              <h2 className="text-[14px] font-bold" style={{ color: headClr }}>Fee Structure</h2>
            </div>
            <p className="text-[12px] mt-1" style={{ color: subClr }}>General fee categories for your program</p>
          </div>
          <div className="divide-y" style={{ borderColor: border }}>
            {feeStructure.map((fee, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:opacity-90 transition-opacity"
                style={{ background: i % 2 === 0 ? (dark ? '#0f1e1e' : '#fafafa') : cardBg }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: fee.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: headClr }}>{fee.label}</p>
                  <p className="text-[11px]" style={{ color: subClr }}>{fee.period}</p>
                </div>
                <span className="text-[12px] font-medium" style={{ color: fee.color }}>{fee.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods + Notice */}
        <div className="space-y-4">
          <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: border }}>
              <div className="flex items-center gap-2">
                <CreditCard size={16} style={{ color: '#1E3535' }} />
                <h2 className="text-[14px] font-bold" style={{ color: headClr }}>Payment Methods</h2>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {paymentMethods.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: rowBg, borderColor: border }}>
                  <span className="text-xl shrink-0">{m.icon}</span>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: headClr }}>{m.name}</p>
                    <p className="text-[11px]" style={{ color: subClr }}>{m.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Note */}
          <div className="rounded-2xl p-4 border" style={{
            background: dark ? '#1a1a0d' : '#fefce8',
            borderColor: dark ? '#3d3318' : '#fde68a',
          }}>
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#b45309' }} />
              <div>
                <p className="text-[13px] font-bold" style={{ color: dark ? '#fbbf24' : '#92400e' }}>Important</p>
                <p className="text-[12px] mt-1 leading-relaxed" style={{ color: dark ? '#d97706' : '#a16207' }}>
                  Always collect an official receipt after fee payment. Keep it safe for future reference.
                  For exact fee amounts and due dates, contact the Admin Office or your class coordinator.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-2xl p-4 border" style={{
            background: dark ? '#0d1a1a' : '#f0fdf9',
            borderColor: dark ? '#1e4030' : '#bbf7d0',
          }}>
            <div className="flex items-start gap-3">
              <CheckCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#059669' }} />
              <div>
                <p className="text-[13px] font-bold" style={{ color: dark ? '#34d399' : '#065f46' }}>Admin Office</p>
                <p className="text-[12px] mt-1" style={{ color: dark ? '#6ee7b7' : '#047857' }}>
                  Monday – Friday: 10:00 AM – 4:00 PM<br />
                  For queries: admin@apollocollege.edu.np
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
