import { BookOpen, Clock, Search, MapPin, Phone, Mail, BookMarked, Wifi, Users, AlertCircle } from 'lucide-react';
import { PageHeader, SearchBar } from '../../components/UI';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';

const resources = [
  { category: 'Reference Books', icon: '📚', count: '2,500+', desc: 'Academic textbooks, encyclopedias and reference materials across all disciplines.' },
  { category: 'Journals & Periodicals', icon: '📰', count: '120+', desc: 'National and international academic journals updated regularly.' },
  { category: 'Digital Library', icon: '💻', count: 'Online', desc: 'Access e-books, research papers, and digital resources via the portal.' },
  { category: 'Previous Year Papers', icon: '📄', count: 'All Years', desc: 'Past exam papers organized by semester and subject for exam preparation.' },
  { category: 'Theses & Projects', icon: '🎓', count: '500+', desc: 'Final year project reports and theses from previous batches.' },
  { category: 'Newspapers', icon: '🗞️', count: 'Daily', desc: 'Major national and English daily newspapers available in reading room.' },
];

const rules = [
  'Library card must be presented at the time of issue.',
  'Books can be borrowed for a maximum of 14 days.',
  'Late return is subject to a fine of Rs. 5 per day per book.',
  'Maximum of 3 books may be borrowed at one time.',
  'Maintain silence and decorum inside the library premises.',
  'Mobile phones must be kept on silent mode.',
  'Food and beverages are strictly not allowed.',
  'Damaged or lost books must be replaced or fined accordingly.',
];

const timings = [
  { day: 'Sunday – Thursday', time: '9:00 AM – 6:00 PM', open: true },
  { day: 'Friday', time: '10:00 AM – 3:00 PM', open: true },
  { day: 'Saturday', time: 'Closed', open: false },
  { day: 'Public Holidays', time: 'Closed', open: false },
];

const popularBooks = [
  { title: 'Engineering Mathematics', author: 'B.S. Grewal', subject: 'Mathematics', available: true },
  { title: 'Data Structures & Algorithms', author: 'Cormen et al.', subject: 'Computer Science', available: true },
  { title: 'Principles of Economics', author: 'N. Gregory Mankiw', subject: 'Economics', available: false },
  { title: 'Organic Chemistry', author: 'Paula Bruice', subject: 'Chemistry', available: true },
  { title: 'Business Communication', author: 'Raman & Singh', subject: 'Management', available: true },
  { title: 'Digital Electronics', author: 'Morris Mano', subject: 'Electronics', available: false },
];

export default function StudentLibrary() {
  const { dark } = useTheme();
  const [search, setSearch] = useState('');

  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#e8edf3';
  const headClr = dark ? '#e2e8f0' : '#1e293b';
  const subClr  = dark ? '#6e7681' : '#64748b';
  const rowBg   = dark ? '#1a2828' : '#f8fafc';

  const filtered = popularBooks.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Library" subtitle="Access library resources, check timings, and browse available books." />

      {/* Quick Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: BookOpen, label: 'Total Books', value: '3,000+', color: '#8B3030' },
          { icon: Users, label: 'Seating Capacity', value: '80 Seats', color: '#1E3535' },
          { icon: Wifi, label: 'Wi-Fi', value: 'Available', color: '#b87a00' },
          { icon: BookMarked, label: 'Borrow Limit', value: '3 Books', color: '#4338ca' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 border shadow-sm" style={{ background: cardBg, borderColor: border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: color + '18' }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p className="text-[16px] font-bold" style={{ color }}>{value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: subClr }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Resources */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: border }}>
              <h2 className="text-[14px] font-bold" style={{ color: headClr }}>Library Resources</h2>
              <p className="text-[12px] mt-0.5" style={{ color: subClr }}>Available collections and materials</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
              {resources.map((r, i) => (
                <div key={i} className="p-4 rounded-xl border" style={{ background: rowBg, borderColor: border }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{r.icon}</span>
                    <div>
                      <p className="text-[13px] font-bold" style={{ color: headClr }}>{r.category}</p>
                      <p className="text-[10px] font-semibold" style={{ color: '#8B3030' }}>{r.count}</p>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: subClr }}>{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Book Search */}
          <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: border }}>
              <h2 className="text-[14px] font-bold mb-3" style={{ color: headClr }}>Popular Books</h2>
              <SearchBar value={search} onChange={setSearch} placeholder="Search by title, author or subject…" />
            </div>
            <div className="divide-y" style={{ borderColor: border }}>
              {filtered.length === 0 ? (
                <div className="py-10 text-center">
                  <Search size={28} className="mx-auto mb-2 opacity-20" style={{ color: headClr }} />
                  <p className="text-[13px]" style={{ color: subClr }}>No books match your search</p>
                </div>
              ) : filtered.map((b, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:opacity-90 transition-opacity"
                  style={{ background: i % 2 === 0 ? (dark ? '#0f1e1e' : '#fafafa') : cardBg }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-[11px] font-bold"
                    style={{ background: ['#8B3030','#1E3535','#b87a00','#4338ca','#0369a1','#2a6648'][i % 6] }}>
                    {b.title[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: headClr }}>{b.title}</p>
                    <p className="text-[11px]" style={{ color: subClr }}>{b.author} · {b.subject}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full`}
                    style={b.available
                      ? { background: dark ? '#1a2e22' : '#f0fdf4', color: dark ? '#34d399' : '#059669' }
                      : { background: dark ? '#2d1517' : '#fff1f2', color: dark ? '#f87171' : '#e11d48' }
                    }>
                    {b.available ? 'Available' : 'Issued'}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t" style={{ borderColor: border }}>
              <p className="text-[11px]" style={{ color: subClr }}>
                For full catalogue, visit the library or contact the librarian.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Timings */}
          <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: border }}>
              <div className="flex items-center gap-2">
                <Clock size={15} style={{ color: '#1E3535' }} />
                <h2 className="text-[14px] font-bold" style={{ color: headClr }}>Opening Hours</h2>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {timings.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: dark ? '#1e2e2e' : '#f1f5f9' }}>
                  <span className="text-[12px] font-medium" style={{ color: headClr }}>{t.day}</span>
                  <span className="text-[11px] font-semibold"
                    style={{ color: t.open ? (dark ? '#34d399' : '#059669') : (dark ? '#6e7681' : '#94a3b8') }}>
                    {t.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: border }}>
              <h2 className="text-[14px] font-bold" style={{ color: headClr }}>Contact</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                { icon: MapPin, text: 'Ground Floor, Main Building' },
                { icon: Phone, text: '+977-01-XXXXXXX' },
                { icon: Mail, text: 'library@apollocollege.edu.np' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: dark ? '#1e2e2e' : '#f1f5f9' }}>
                    <Icon size={13} style={{ color: '#1E3535' }} />
                  </div>
                  <p className="text-[12px]" style={{ color: subClr }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: cardBg, borderColor: border }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: border }}>
              <div className="flex items-center gap-2">
                <AlertCircle size={14} style={{ color: '#b45309' }} />
                <h2 className="text-[14px] font-bold" style={{ color: headClr }}>Library Rules</h2>
              </div>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[11px] font-bold mt-0.5 shrink-0" style={{ color: '#8B3030' }}>{i + 1}.</span>
                    <span className="text-[11px] leading-relaxed" style={{ color: subClr }}>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
