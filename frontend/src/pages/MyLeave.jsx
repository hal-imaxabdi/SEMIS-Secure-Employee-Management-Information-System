import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyLeave() {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ type: 'annual', startDate: '', endDate: '', reason: '' });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchLeaves = () => {
    axios.get('http://localhost:5000/api/employee/leave', { headers })
      .then(res => setLeaves(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/employee/leave', form, { headers });
      toast.success('Leave request submitted');
      setShowModal(false);
      setForm({ type: 'annual', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (s) => {
    if (s === 'approved') return 'bg-green-50 text-green-700';
    if (s === 'rejected') return 'bg-red-50 text-red-500';
    return 'bg-yellow-50 text-yellow-700';
  };

  const typeStyle = (t) => {
    if (t === 'annual') return 'bg-blue-50 text-blue-600';
    if (t === 'sick') return 'bg-red-50 text-red-500';
    return 'bg-gray-100 text-gray-500';
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition";

  return (
    <Layout>
      <div className="p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">EMPLOYEE</p>
            <h1 className="text-2xl font-semibold text-gray-900">My Leave</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            <Plus size={15} />
            Request Leave
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pending', value: leaves.filter(l => l.status === 'pending').length, color: 'text-yellow-500' },
            { label: 'Approved', value: leaves.filter(l => l.status === 'approved').length, color: 'text-green-600' },
            { label: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length, color: 'text-red-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{label}</p>
              <p className={`text-3xl font-semibold ${color}`}>{loading ? '—' : value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Type</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Start</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">End</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Days</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Reason</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-6 text-gray-400 text-center">No leave requests yet.</td></tr>
              ) : leaves.map(l => (
                <tr key={l._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeStyle(l.type)}`}>{l.type}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{new Date(l.startDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(l.endDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-gray-600">{l.days}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-[180px] truncate">{l.reason || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(l.status)}`}>{l.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Request Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Leave Type</label>
                <select className={inputClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="annual">Annual</option>
                  <option value="sick">Sick</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Start Date</label>
                  <input required type="date" className={inputClass} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">End Date</label>
                  <input required type="date" className={inputClass} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Reason</label>
                <input className={inputClass} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Optional" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50 transition">
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}