import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HRLeave() {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchLeaves = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/hr/leave', { headers })
      .then(res => setLeaves(res.data))
      .catch(() => toast.error('Failed to load leave requests'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleAction = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/hr/leave/${id}`,
        { status },
        { headers }
      );
      toast.success(`Leave ${status} successfully`);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const filtered = leaves.filter(l => {
    const name = `${l.employeeId?.firstName || ''} ${l.employeeId?.lastName || ''}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchFilter = filter === 'all' || l.status === filter;
    return matchSearch && matchFilter;
  });

  const statusBadge = (status) => {
    if (status === 'approved') return 'bg-green-50 text-green-700';
    if (status === 'rejected') return 'bg-red-50 text-red-500';
    return 'bg-yellow-50 text-yellow-700';
  };

  const typeBadge = (type) => {
    if (type === 'annual') return 'bg-blue-50 text-blue-600';
    if (type === 'sick') return 'bg-red-50 text-red-500';
    return 'bg-gray-100 text-gray-600';
  };

  const tabs = ['all', 'pending', 'approved', 'rejected'];

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">HR</p>
            <h1 className="text-2xl font-semibold text-gray-900">Leave Requests</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
            {leaves.filter(l => l.status === 'pending').length} pending
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                  filter === t
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t}
                {t === 'pending' && leaves.filter(l => l.status === 'pending').length > 0 && (
                  <span className="ml-1.5 bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full text-[10px]">
                    {leaves.filter(l => l.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Employee</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Type</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">From</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">To</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Days</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Reason</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-6 text-gray-400 text-center">No leave requests found.</td></tr>
              ) : filtered.map((l) => (
                <tr key={l._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="text-gray-800 font-medium">
                      {l.employeeId?.firstName} {l.employeeId?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{l.employeeId?.department}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${typeBadge(l.type)}`}>
                      {l.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {l.startDate ? new Date(l.startDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {l.endDate ? new Date(l.endDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{l.days || '—'}</td>
                  <td className="px-6 py-4 text-gray-400 max-w-[160px] truncate">{l.reason || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(l.status)}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {l.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(l._id, 'approved')}
                          className="text-xs text-green-600 hover:text-green-800 font-medium transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(l._id, 'rejected')}
                          className="text-xs text-red-400 hover:text-red-600 font-medium transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </Layout>
  );
}