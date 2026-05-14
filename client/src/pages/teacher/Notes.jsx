import { useState, useEffect, useRef } from 'react';
import {
  Upload, Trash2, Download, FileText, BookOpen, Search,
  SlidersHorizontal, X, File, FileArchive, Presentation,
  Calendar, GraduationCap, Eye, Plus, FolderOpen,
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

// ── File type config ──────────────────────────────────────
const FILE_TYPES = {
  PDF:  { bg: '#fee2e2', color: '#dc2626', darkBg: '#2a1010', darkColor: '#f87171', icon: FileText },
  DOC:  { bg: '#dbeafe', color: '#2563eb', darkBg: '#0f1a2e', darkColor: '#60a5fa', icon: File },
  DOCX: { bg: '#dbeafe', color: '#2563eb', darkBg: '#0f1a2e', darkColor: '#60a5fa', icon: File },
  PPT:  { bg: '#ffedd5', color: '#ea580c', darkBg: '#2a1500', darkColor: '#fb923c', icon: Presentation },
  PPTX: { bg: '#ffedd5', color: '#ea580c', darkBg: '#2a1500', darkColor: '#fb923c', icon: Presentation },
  ZIP:  { bg: '#f3f4f6', color: '#6b7280', darkBg: '#1a1a1a', darkColor: '#9ca3af', icon: FileArchive },
  RAR:  { bg: '#f3f4f6', color: '#6b7280', darkBg: '#1a1a1a', darkColor: '#9ca3af', icon: FileArchive },
  XLS:  { bg: '#dcfce7', color: '#16a34a', darkBg: '#0a2018', darkColor: '#4ade80', icon: File },
  XLSX: { bg: '#dcfce7', color: '#16a34a', darkBg: '#0a2018', darkColor: '#4ade80', icon: File },
};
const getFileType = (url) => {
  const ext = url?.split('.').pop()?.toUpperCase() || 'FILE';
  return { ext, ...(FILE_TYPES[ext] || { bg: '#e0f2fe', color: '#0284c7', darkBg: '#0f1e2e', darkColor: '#38bdf8', icon: FileText }) };
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title',  label: 'Title A–Z' },
];

// ── Upload Modal ──────────────────────────────────────────
function UploadModal({ onClose, onSuccess, courses, dark }) {
  const [form, setForm]     = useState({ title: '', description: '', courseId: '' });
  const [file, setFile]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const border  = dark ? '#1e2e2e' : '#e2e8f0';
  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const headClr = dark ? '#e2e8f0' : '#0f172a';
  const subClr  = dark ? '#6e7681' : '#64748b';
  const inputBg = dark ? '#0f1e1e' : '#f8fafc';

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      await api.post('/teacher/notes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Material uploaded successfully');
      onSuccess();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setLoading(false); }
  };

  const inputCls = `w-full px-4 py-3 rounded-xl text-[14px] border outline-none transition-all focus:ring-2 focus:ring-[#1E3535]/30`;
  const inputStyle = { background: inputBg, borderColor: border, color: headClr };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: cardBg, border: `1px solid ${border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: border, background: dark ? '#0a1818' : '#f0faf8' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: dark ? '#1a2e2e' : '#d4ede8' }}>
              <Upload size={18} style={{ color: '#1E3535' }} />
            </div>
            <div>
              <p className="text-[16px] font-bold" style={{ color: headClr }}>Upload Material</p>
              <p className="text-[12px]" style={{ color: subClr }}>Share notes and resources with students</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
            style={{ background: dark ? '#1a2828' : '#f1f5f9', color: subClr }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Course */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: subClr }}>Course</label>
            <select required value={form.courseId} onChange={f('courseId')}
              className={inputCls} style={inputStyle}>
              <option value=""></option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: subClr }}>Title</label>
            <input required value={form.title} onChange={f('title')}
              className={inputCls} style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: subClr }}>Description</label>
            <textarea rows={3} value={form.description} onChange={f('description')}
              className={`${inputCls} resize-none`} style={inputStyle} />
          </div>

          {/* File drop zone */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: subClr }}>
              File <span className="normal-case font-normal">(optional, max 10 MB)</span>
            </label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="relative cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all"
              style={{
                borderColor: dragOver ? '#1E3535' : border,
                background: dragOver ? (dark ? '#0f1e1e' : '#f0faf8') : inputBg,
              }}>
              <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={20} style={{ color: '#1E3535' }} />
                  <div className="text-left">
                    <p className="text-[13px] font-semibold" style={{ color: headClr }}>{file.name}</p>
                    <p className="text-[11px]" style={{ color: subClr }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                    className="ml-auto p-1 rounded-lg hover:opacity-70" style={{ color: subClr }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={22} className="mx-auto mb-2" style={{ color: subClr }} />
                  <p className="text-[13px] font-medium" style={{ color: headClr }}>Drop file here or click to browse</p>
                  <p className="text-[11px] mt-1" style={{ color: subClr }}>PDF, DOCX, PPT, ZIP and more</p>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-[14px] font-medium border transition-all hover:opacity-80"
              style={{ borderColor: border, color: subClr }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1E3535 0%, #2a4a4a 100%)', boxShadow: '0 4px 14px rgba(30,53,53,0.35)' }}>
              {loading ? 'Uploading…' : 'Upload Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Note Card ─────────────────────────────────────────────
function NoteCard({ note, dark, onDelete }) {
  const border  = dark ? '#1e2e2e' : '#e2e8f0';
  const headClr = dark ? '#e2e8f0' : '#0f172a';
  const subClr  = dark ? '#6e7681' : '#64748b';
  const cardBg  = dark ? '#131e1e' : '#ffffff';

  const { ext, bg, color, darkBg, darkColor, icon: FileIcon } = getFileType(note.fileUrl);
  const iconBg  = dark ? darkBg  : bg;
  const iconClr = dark ? darkColor : color;

  const dateStr = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="group rounded-2xl border overflow-hidden shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ background: cardBg, borderColor: border }}>

      {/* Top color accent */}
      <div className="h-1" style={{ background: iconClr }} />

      <div className="p-5">
        {/* Icon + title row */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 gap-0.5"
            style={{ background: iconBg }}>
            <FileIcon size={16} style={{ color: iconClr }} />
            <span className="text-[9px] font-bold" style={{ color: iconClr }}>{ext}</span>
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-bold text-[15px] leading-snug truncate" style={{ color: headClr }}>{note.title}</h3>
            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ background: dark ? '#1a2e2e' : '#e8f4f1', color: '#1E3535' }}>
              <BookOpen size={10} />
              {note.course?.name}
            </span>
          </div>
        </div>

        {/* Description */}
        {note.description ? (
          <p className="text-[12px] leading-relaxed mb-4 line-clamp-2" style={{ color: subClr }}>
            {note.description}
          </p>
        ) : (
          <div className="mb-4 h-8" />
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4 text-[11px]" style={{ color: subClr }}>
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {dateStr}
          </span>
          {note.uploadedBy?.name && (
            <>
              <span className="w-1 h-1 rounded-full" style={{ background: subClr }} />
              <span className="flex items-center gap-1">
                <GraduationCap size={11} />
                {note.uploadedBy.name}
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: border }}>
          {note.fileUrl && (
            <a href={note.fileUrl} target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
              style={{ background: dark ? '#1a2828' : '#e8f4f1', color: '#1E3535' }}>
              <Download size={13} /> Download
            </a>
          )}
          {note.fileUrl && (
            <a href={note.fileUrl} target="_blank" rel="noreferrer"
              className="p-2 rounded-xl transition-all hover:opacity-80"
              style={{ background: dark ? '#1a2828' : '#f1f5f9', color: subClr }}
              title="Preview">
              <Eye size={14} />
            </a>
          )}
          <button onClick={() => onDelete(note._id)}
            className="p-2 rounded-xl transition-all hover:opacity-80"
            style={{ background: dark ? '#2a1010' : '#fee2e2', color: '#dc2626' }}
            title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function TeacherNotes() {
  const [notes, setNotes]         = useState([]);
  const [courses, setCourses]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterCourse, setFilter] = useState('');
  const [search, setSearch]       = useState('');
  const [sort, setSort]           = useState('newest');
  const { dark } = useTheme();

  const bg      = dark ? '#0d1212' : '#f4f6f8';
  const cardBg  = dark ? '#131e1e' : '#ffffff';
  const border  = dark ? '#1e2e2e' : '#e2e8f0';
  const headClr = dark ? '#e2e8f0' : '#0f172a';
  const subClr  = dark ? '#6e7681' : '#64748b';
  const inputBg = dark ? '#0f1e1e' : '#ffffff';

  const load = () => api.get('/teacher/notes', { params: { courseId: filterCourse } }).then(r => setNotes(r.data));
  useEffect(() => { api.get('/teacher/courses').then(r => setCourses(r.data)); }, []);
  useEffect(() => { load(); }, [filterCourse]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this material?')) return;
    await api.delete(`/teacher/notes/${id}`);
    toast.success('Deleted'); load();
  };

  // Filter + sort
  const filtered = notes
    .filter(n => {
      const q = search.toLowerCase();
      return !q || n.title?.toLowerCase().includes(q) || n.course?.name?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'title')  return a.title.localeCompare(b.title);
      return 0;
    });

  const inputBase = `px-4 py-2.5 rounded-xl text-[13px] border outline-none transition-all`;
  const inputStyle = { background: inputBg, borderColor: border, color: headClr };

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div className="max-w-screen-xl mx-auto space-y-6 p-1">

        {/* ── Page Header ─────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden shadow-sm"
          style={{ background: 'linear-gradient(135deg, #0d2222 0%, #1E3535 60%, #2a5050 100%)' }}>
          <div className="px-8 py-8 relative">
            <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at right, #F2C04E, transparent)' }} />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative">
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2"
                  style={{ background: 'rgba(242,192,78,0.2)', color: '#F2C04E' }}>
                  Teacher Portal
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight">Notes & Materials</h1>
                <p className="mt-1.5 text-[14px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Share study resources, lecture notes, and materials with your students.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-[14px] font-semibold text-white shrink-0 transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
                <Upload size={16} /> Upload Material
              </button>
            </div>

            {/* Stats chips */}
            <div className="flex gap-3 mt-5 flex-wrap">
              {[
                { label: 'Total Materials', value: notes.length },
                { label: 'Courses',         value: courses.length },
                { label: 'File Types',      value: [...new Set(notes.map(n => n.fileUrl?.split('.').pop()?.toUpperCase()).filter(Boolean))].length },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <span className="text-lg font-bold text-white">{value}</span>
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Action Bar ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: subClr }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or course…"
              className={`${inputBase} w-full pl-10`}
              style={inputStyle}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                style={{ color: subClr }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Course filter */}
          <select value={filterCourse} onChange={e => setFilter(e.target.value)}
            className={`${inputBase} min-w-44`} style={inputStyle}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} style={{ color: subClr }} className="shrink-0" />
            <select value={sort} onChange={e => setSort(e.target.value)}
              className={`${inputBase} min-w-36`} style={inputStyle}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Upload button (secondary, for non-banner context) */}
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white shrink-0 transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #1E3535 0%, #2a4a4a 100%)', boxShadow: '0 4px 12px rgba(30,53,53,0.3)' }}>
            <Plus size={15} /> Upload
          </button>
        </div>

        {/* ── Results summary ──────────────────────────── */}
        {(search || filterCourse) && (
          <div className="flex items-center gap-2 text-[12px]" style={{ color: subClr }}>
            <span>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            {search && (
              <span className="px-2 py-0.5 rounded-full font-medium"
                style={{ background: dark ? '#1a2828' : '#e8f4f1', color: '#1E3535' }}>
                "{search}"
              </span>
            )}
            {filterCourse && (
              <span className="px-2 py-0.5 rounded-full font-medium"
                style={{ background: dark ? '#1a2828' : '#e8f4f1', color: '#1E3535' }}>
                {courses.find(c => c._id === filterCourse)?.name}
              </span>
            )}
          </div>
        )}

        {/* ── Empty state ──────────────────────────────── */}
        {filtered.length === 0 && (
          <div className="rounded-2xl border p-16 text-center shadow-sm"
            style={{ background: cardBg, borderColor: border }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: dark ? '#1a2828' : '#e8f4f1' }}>
              <FolderOpen size={28} style={{ color: dark ? '#2a4a4a' : '#a0c4bb' }} />
            </div>
            <p className="font-bold text-[16px]" style={{ color: headClr }}>
              {search || filterCourse ? 'No materials found' : 'No materials uploaded yet'}
            </p>
            <p className="text-[13px] mt-1.5" style={{ color: subClr }}>
              {search || filterCourse
                ? 'Try adjusting your search or filter.'
                : 'Click "Upload Material" to share resources with students.'}
            </p>
            {!search && !filterCourse && (
              <button onClick={() => setShowModal(true)}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white mx-auto transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1E3535 0%, #2a4a4a 100%)' }}>
                <Upload size={14} /> Upload First Material
              </button>
            )}
          </div>
        )}

        {/* ── Notes Grid ──────────────────────────────── */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {filtered.map(n => (
              <NoteCard key={n._id} note={n} dark={dark} onDelete={handleDelete} />
            ))}
          </div>
        )}

      </div>

      {/* ── Upload Modal ────────────────────────────── */}
      {showModal && (
        <UploadModal
          dark={dark}
          courses={courses}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
