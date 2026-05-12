import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function MyPayslips() {
  const { token } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/employee/payroll', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setPayrolls(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">EMPLOYEE</p>
          <h1 className="text-2xl font-semibold text-gray-900">My Payslips</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Total Payslips', value: payrolls.length, color: 'text-gray-800' },
            { label: 'Processed', value: payrolls.filter(p => p.status === 'processed').length, color: 'text-green-600' },
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
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Month</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Allowances</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Deductions</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : payrolls.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-6 text-gray-400 text-center">No payslips yet.</td></tr>
              ) : payrolls.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-800 font-medium">{p.month}</td>
                  <td className="px-6 py-4 text-gray-600">{p.allowances != null ? `$${p.allowances.toLocaleString()}` : '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{p.deductions != null ? `$${p.deductions.toLocaleString()}` : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === 'processed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
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