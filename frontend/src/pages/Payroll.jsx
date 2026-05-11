import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Search } from 'lucide-react';

export default function Payroll() {
  const { token, user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('http://localhost:5000/api/hr/payroll', { headers })
      .then(res => setPayrolls(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = payrolls.filter(p => {
    const name = p.employeeId
      ? `${p.employeeId.firstName} ${p.employeeId.lastName}`.toLowerCase()
      : '';
    return name.includes(search.toLowerCase());
  });

  const statusStyle = (status) => {
    if (status === 'processed') return 'bg-green-50 text-green-700';
    return 'bg-yellow-50 text-yellow-700';
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
            <h1 className="text-2xl font-semibold text-gray-900">Payroll</h1>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: 'Total Processed',
              value: payrolls.filter(p => p.status === 'processed').length,
              color: 'text-green-600'
            },
            {
              label: 'Drafts',
              value: payrolls.filter(p => p.status === 'draft').length,
              color: 'text-yellow-600'
            },
            {
              label: 'Total Records',
              value: payrolls.length,
              color: 'text-gray-800'
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
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Month</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Allowances</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Deductions</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-6 text-gray-400 text-center">No payroll records found.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {p.employeeId ? `${p.employeeId.firstName} ${p.employeeId.lastName}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.month}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {p.allowances != null ? `$${p.allowances.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {p.deductions != null ? `$${p.deductions.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {p.generatedAt ? new Date(p.generatedAt).toLocaleDateString() : '—'}
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