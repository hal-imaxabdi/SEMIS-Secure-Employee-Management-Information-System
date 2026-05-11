import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Search } from 'lucide-react';

export default function Leave() {
  const { token, user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('http://localhost:5000/api/hr/leave', { headers })
      .then(res => setLeaves(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = leaves.filter(l => {
    const name = l.employeeId
      ? `${l.employeeId.firstName} ${l.employeeId.lastName}`.toLowerCase()
      : '';
    return name.includes(search.toLowerCase());
  });

  const statusStyle = (status) => {
    if (status === 'approved') return 'bg-green-50 text-green-700';
    if (status === 'rejected') return 'bg-red-50 text-red-500';
    return 'bg-yellow-50 text-yellow-700';
  };

  const typeStyle = (type) => {
    if (type === 'annual') return 'bg-blue-50 text-blue-600';
    if (type === 'sick') return 'bg-red-50 text-red-500';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
              {user?.role?.toUpperCase()}
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">Leave Requests</h1>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: 'Pending',
              value: leaves.filter(l => l.status === 'pending').length,
              color: 'text-yellow-600'
            },
            {
              label: 'Approved',
              value: leaves.filter(l => l.status === 'approved').length,
              color: 'text-green-600'
            },
            {
              label: 'Rejected',
              value: leaves.filter(l => l.status === 'rejected').length,
              color: 'text-red-500'
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{label}</p>
              <p className={`text-3xl font-semibold ${color}`}>{loading ? '—' : value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Employee</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Type</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Start Date</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">End Date</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Days</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Reason</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-6 text-gray-400 text-center">No leave requests found.</td></tr>
              ) : filtered.map((l) => (
                <tr key={l._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {l.employeeId ? `${l.employeeId.firstName} ${l.employeeId.lastName}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeStyle(l.type)}`}>
                      {l.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {l.startDate ? new Date(l.startDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {l.endDate ? new Date(l.endDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{l.days ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-[180px] truncate">{l.reason || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(l.status)}`}>
                      {l.status}
                    </span>
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