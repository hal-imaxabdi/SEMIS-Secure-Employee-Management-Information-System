import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function MyAttendance() {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/employee/attendance', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setRecords(res.data))
      .finally(() => setLoading(false));
  }, []);

  const statusStyle = (status) => {
    if (status === 'present') return 'bg-green-50 text-green-700';
    if (status === 'late') return 'bg-yellow-50 text-yellow-700';
    return 'bg-red-50 text-red-500';
  };

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  const present = records.filter(r => r.status === 'present').length;
  const late = records.filter(r => r.status === 'late').length;
  const absent = records.filter(r => r.status === 'absent').length;

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">EMPLOYEE</p>
          <h1 className="text-2xl font-semibold text-gray-900">My Attendance</h1>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Present', value: present, color: 'text-green-600' },
            { label: 'Late', value: late, color: 'text-yellow-500' },
            { label: 'Absent', value: absent, color: 'text-red-500' },
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
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Date</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Check In</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Check Out</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Hours</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-6 text-gray-400 text-center">No attendance records yet.</td></tr>
              ) : records.map(r => (
                <tr key={r._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-800">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-gray-600">{formatTime(r.checkIn)}</td>
                  <td className="px-6 py-4 text-gray-600">{formatTime(r.checkOut)}</td>
                  <td className="px-6 py-4 text-gray-600">{r.hoursWorked ? `${r.hoursWorked}h` : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(r.status)}`}>
                      {r.status}
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