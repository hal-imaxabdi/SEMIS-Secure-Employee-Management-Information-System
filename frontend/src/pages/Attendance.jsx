import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Attendance() {
  const { token, user } = useAuth();
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    employeeId: '', date: '', checkIn: '', checkOut: '', status: 'present', notes: ''
  });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = () => {
    Promise.all([
      axios.get('http://localhost:5000/api/hr/attendance', { headers }),
      axios.get('http://localhost:5000/api/hr/employees', { headers }),
    ]).then(([attRes, empRes]) => {
      setRecords(attRes.data);
      setEmployees(empRes.data);
      if (empRes.data.length > 0) setForm(f => ({ ...f, employeeId: empRes.data[0]._id }));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/hr/attendance', form, { headers });
      toast.success('Attendance recorded');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (status) => {
    if (status === 'present') return 'bg-green-50 text-green-700';
    if (status === 'late') return 'bg-yellow-50 text-yellow-700';
    return 'bg-red-50 text-red-500';
  };

  const filtered = records.filter(r => {
    const name = r.employeeId
      ? `${r.employeeId.firstName} ${r.employeeId.lastName}`.toLowerCase()
      : '';
    return name.includes(search.toLowerCase());
  });

  const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition";

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>
          </div>
          {user?.role !== 'admin' && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition"
            >
              <Clock size={15} />
              Record Attendance
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Present Today', value: records.filter(r => r.status === 'present').length, color: 'text-green-600' },
            { label: 'Late Today', value: records.filter(r => r.status === 'late').length, color: 'text-yellow-600' },
            { label: 'Absent Today', value: records.filter(r => r.status === 'absent').length, color: 'text-red-500' },
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
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Date</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Check In</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Check Out</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Hours</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-6 text-gray-400 text-center">No records found.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {r.employeeId ? `${r.employeeId.firstName} ${r.employeeId.lastName}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatTime(r.checkIn)}</td>
                  <td className="px-6 py-4 text-gray-600">{formatTime(r.checkOut)}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {r.hoursWorked ? `${r.hoursWorked}h` : '—'}
                  </td>
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

      {/* Record Attendance Modal — HR only */}
      {showModal && user?.role !== 'admin' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Record Attendance</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Employee</label>
                <select className={inputClass} value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})}>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Date</label>
                <input required type="date" className={inputClass} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Check In</label>
                  <input type="time" className={inputClass} value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Check Out</label>
                  <input type="time" className={inputClass} value={form.checkOut} onChange={e => setForm({...form, checkOut: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Status</label>
                <select className={inputClass} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Notes</label>
                <input className={inputClass} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Optional" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50 transition">
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}