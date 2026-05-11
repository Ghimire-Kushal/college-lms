import { useState, useEffect } from 'react';
import { Upload, CheckCircle, Clock } from 'lucide-react';
import Modal from '../../components/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

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
  const overdue = assignments.filter(a => new Date(a.dueDate) < now && !a.submission);

  const AssignmentCard = ({ a, showSubmit = false }) => (
    <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:border-indigo-100 transition-colors">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${a.submission ? 'bg-green-50 text-green-600' : new Date(a.dueDate) < now ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
        {a.submission ? <CheckCircle size={18} /> : <Clock size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 text-sm">{a.title}</h3>
        {a.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{a.description}</p>}
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span>{a.course?.name}</span>
          <span>Due: {new Date(a.dueDate).toLocaleString()}</span>
          <span>Max: {a.totalMarks}</span>
        </div>
        {a.submission?.status === 'graded' && (
          <div className="mt-2 text-xs bg-green-50 text-green-700 px-2 py-1 rounded inline-block">
            Marks: {a.submission.marks}/{a.totalMarks} {a.submission.feedback && `· "${a.submission.feedback}"`}
          </div>
        )}
        {a.submission?.status === 'submitted' && (
          <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block">Submitted – awaiting review</div>
        )}
      </div>
      {showSubmit && !a.submission && (
        <button onClick={() => openSubmit(a)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 shrink-0">
          <Upload size={12} /> Submit
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> Pending ({upcoming.length})
          </h2>
          <div className="space-y-3">{upcoming.map(a => <AssignmentCard key={a._id} a={a} showSubmit />)}</div>
        </div>
      )}

      {submitted.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Submitted ({submitted.length})
          </h2>
          <div className="space-y-3">{submitted.map(a => <AssignmentCard key={a._id} a={a} />)}</div>
        </div>
      )}

      {overdue.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-red-100">
          <h2 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Overdue ({overdue.length})
          </h2>
          <div className="space-y-3">{overdue.map(a => <AssignmentCard key={a._id} a={a} />)}</div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">No assignments yet</div>
      )}

      {modal === 'submit' && (
        <Modal title={`Submit: ${selected?.title}`} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p><strong>Course:</strong> {selected?.course?.name}</p>
              <p><strong>Due:</strong> {new Date(selected?.dueDate).toLocaleString()}</p>
              <p><strong>Max Marks:</strong> {selected?.totalMarks}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Answer / Notes (optional)</label>
              <textarea rows={4} value={content} onChange={e => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Type your answer here..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Upload File (optional, max 10MB)</label>
              <input type="file" onChange={e => setFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">
                {loading ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
