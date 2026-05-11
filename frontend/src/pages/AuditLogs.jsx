import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Search, Shield } from 'lucide-react';

export default function AuditLogs() {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/audit-logs', { headers })
      .then(res => setLogs(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l => {
    const user = l.userId
      ? `${l.userId.email}`.toLowerCase()
      : '';
    const action = l.action?.toLowerCase() || '';
    return user.includes(search.toLowerCase()) || action.includes(search.toLowerCase());
  });

  const actionStyle = (action) => {
    if (action?.includes('LOGIN')) return 'bg-blue-50 text-blue-600';
    if (action?.includes('CREATE') || action?.includes('ADD')) return 'bg-green-50 text-green-700';
    if (action?.includes('DELETE') || action?.includes('DEACTIVATE')) return 'bg-red-50 text-red-500';
    if (action?.includes('UPDATE') || action?.includes('EDIT')) return 'bg-yellow-50 text-yellow-700';
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
            <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-200 px-3 py-2 rounded-lg">
            <Shield size={13} />
            Read-only · Append-only collection
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: 'Total Events',
              value: logs.length,
              color: 'text-gray-800'
            },
            {
              label: 'Login Events',
              value: logs.filter(l => l.action?.includes('LOGIN')).length,
              color: 'text-blue-600'
            },
            {
              label: 'Critical Actions',
              value: logs.filter(l =>
                l.action?.includes('DELETE') || l.action?.includes('DEACTIVATE')
              ).length,
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
            placeholder="Search by email or action..."
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
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">User</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Action</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Target</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">IP Address</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-6 text-gray-400 text-center">No audit logs found.</td></tr>
              ) : filtered.map((l) => (
                <tr key={l._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {l.userId?.email || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${actionStyle(l.action)}`}>
                      {l.action || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {l.targetModel ? `${l.targetModel}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs font-mono">
                    {l.ipAddress || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {l.timestamp
                      ? new Date(l.timestamp).toLocaleString()
                      : '—'}
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