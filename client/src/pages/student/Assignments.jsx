import { useState, useEffect } from 'react';
import { Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import { PrimaryBtn, SecondaryBtn, FormField, inputCls, Badge } from '../../components/UI';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [modal, setModal]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [content, setContent]         = useState('');
  const [file, setFile]               = useState(null);
  const [loading, setLoading]         = useState(false);

  const load = () => api.get('/student/assignments').then(r => setAssignments(r.data));
  useEffect(() => { load(); }, []);

  const openSubmit = (a) => { setSelected(a); setContent(''); setFile(null); setModal('submit'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      if (content) fd.append('content', content);
      if (file) fd.append('file', file);
      await api.post(`/student/assignments/${selected._id}/submit`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Assignment submitted!');
      load(); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const now = new Date();
  const upcoming = assignments.filter(a => new Date(a.dueDate) >= now && !a.submission);
  const submitted = assignments.filter(a => a.submission);
  const overdue   = assignments.filter(a => new Date(a.dueDate) < now && !a.submission);

  const AssignmentCard = ({ a, showSubmit = false }) => {
    const past = new Date(a.dueDate) < now;
    const graded = a.submission?.status === 'graded';
    const daysLeft = Math.ceil((new Date(a.dueDate) - now) / (1000 * 60 * 60 * 24));

    return (
      <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all ${past && !a.submission ? 'border-rose-200' : a.submission ? 'border-emerald-100' : 'border-slate-100'}`}>
        <div className={`h-1 ${graded ? 'bg-emerald-500' : a.submission ? 'bg-sky-500' : past ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'}`} />
        <div className="p-4 flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${graded ? 'bg-emerald-50 text-emerald-600' : a.submission ? 'bg-sky-50 text-sky-600' : past ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
            {graded ? <CheckCircle size={18} /> : a.submission ? <CheckCircle size={18} /> : past ? <AlertCircle size={18} /> : <Clock size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <h3 className="font-bold text-slate-800 text-[14px]">{a.title}</h3>
              <Badge color="indigo">{a.course?.name}</Badge>
            </div>
            {a.description && <p className="text-[12px] text-slate-500 mb-2 line-clamp-1">{a.description}</p>}
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>Due: {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span>Max: {a.totalMarks}</span>
            </div>
            {graded && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-semibold border border-emerald-100">
                <CheckCircle size={11} /> {a.submission.marks}/{a.totalMarks}
                {a.submission.feedback && <span className="text-emerald-600"> · "{a.submission.feedback}"</span>}
              </div>
            )}
            {a.submission?.status === 'submitted' && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg font-semibold border border-sky-100">
                Submitted · awaiting review
              </div>
            )}
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            {!past && !a.submission && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${daysLeft <= 2 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                {daysLeft}d left
              </span>
            )}
            {showSubmit && !a.submission && (
              <button onClick={() => openSubmit(a)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                <Upload size={11} /> Submit
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Section = ({ title, items, dotColor, showSubmit = false, urgent = false }) => (
    <div className={`bg-white rounded-2xl p-5 border shadow-sm ${urgent ? 'border-rose-200' : 'border-slate-100'}`}>
      <h2 className={`text-[14px] font-bold mb-3 flex items-center gap-2 ${urgent ? 'text-rose-600' : 'text-slate-700'}`}>
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
        {title} ({items.length})
      </h2>
      <div className="space-y-2.5">{items.map(a => <AssignmentCard key={a._id} a={a} showSubmit={showSubmit} />)}</div>
    </div>
  );

  return (
    <div className="space-y-5">
      {upcoming.length  > 0 && <Section title="Pending"   items={upcoming}  dotColor="bg-indigo-500"  showSubmit />}
      {submitted.length > 0 && <Section title="Submitted" items={submitted} dotColor="bg-emerald-500" />}
      {overdue.length   > 0 && <Section title="Overdue"   items={overdue}   dotColor="bg-rose-500"    urgent />}

      {assignments.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <CheckCircle size={36} className="mx-auto text-emerald-200 mb-3" />
          <p className="text-slate-500 font-medium">No assignments yet</p>
          <p className="text-sm text-slate-400 mt-1">Your teachers haven't assigned any work yet.</p>
        </div>
      )}

      {modal === 'submit' && (
        <Modal title={`Submit: ${selected?.title}`} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-[12px]">
              <div><p className="text-slate-400 font-medium">Course</p><p className="text-slate-700 font-semibold">{selected?.course?.name}</p></div>
              <div><p className="text-slate-400 font-medium">Due</p><p className="text-slate-700 font-semibold">{new Date(selected?.dueDate).toLocaleDateString()}</p></div>
              <div><p className="text-slate-400 font-medium">Max Marks</p><p className="text-slate-700 font-semibold">{selected?.totalMarks}</p></div>
            </div>
            <FormField label="Answer / Notes (optional)">
              <textarea rows={4} value={content} onChange={e => setContent(e.target.value)}
                className={`${inputCls} resize-none`} placeholder="Type your answer here..." />
            </FormField>
            <FormField label="Upload File (optional, max 10MB)">
              <input type="file" onChange={e => setFile(e.target.files[0])}
                className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </FormField>
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
              <SecondaryBtn type="button" onClick={() => setModal(null)}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Assignment'}
              </PrimaryBtn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
