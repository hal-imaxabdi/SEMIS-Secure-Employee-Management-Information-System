import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HRAttendance() {
  const { token } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterEmpId, setFilterEmpId] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    date: new Date().toISOString().slice(0, 10),
    checkIn: '',
    checkOut: '',
    status: 'present',
  });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAttendance = (empId) => {
    const url = empId
      ? `http://localhost:5000/api/hr/attendance/${empId}`
      : 'http://localhost:5000/api/hr/attendance';
    axios.get(url, { headers }).then(res => setAttendance(res.data)).catch(() => {});
  };

  const fetchData = () => {
    axios.get('http://localhost:5000/api/hr/employees', { headers })
      .then(res => setEmployees(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    fetchAttendance('');
  }, []);

  useEffect(() => {
    fetchAttendance(filterEmpId);
  }, [filterEmpId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        employeeId: form.employeeId,
        date: form.date,
        status: form.status,
        checkIn: form.checkIn ? `${form.date}T${form.checkIn}:00.000Z` : undefined,
        checkOut: form.checkOut ? `${form.date}T${form.checkOut}:00.000Z` : undefined,
      };
      await axios.post('http://localhost:5000/api/hr/attendance', payload, { headers });
      toast.success('Attendance recorded');
      fetchAttendance(filterEmpId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = attendance.filter(a => {
    const name = `${a.employeeId?.firstName || ''} ${a.employeeId?.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const statusBadge = (status) => {
    if (status === 'present') return 'bg-emerald-50 text-emerald-700';
    if (status === 'absent') return 'bg-rose-50 text-rose-600';
    if (status === 'late') return 'bg-amber-50 text-amber-700';
    return 'bg-gray-100 text-gray-500';
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition";

  return (
    <Layout>
      <div className="p-8">

        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">HR</p>
          <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>
        </div>

        {/* Record Attendance Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <p className="text-xs font-medium text-gray-900 mb-4">Record Attendance</p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Employee</label>
                <select
                  required
                  className={inputClass}
                  value={form.employeeId}
                  onChange={e => setForm({ ...form, employeeId: e.target.value })}
                >
                  <option value="">Select employee...</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Date</label>
                <input
                  required
                  type="date"
                  className={inputClass}
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Check In</label>
                <input
                  type="time"
                  className={inputClass}
                  value={form.checkIn}
                  onChange={e => setForm({ ...form, checkIn: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Check Out</label>
                <input
                  type="time"
                  className={inputClass}
                  value={form.checkOut}
                  onChange={e => setForm({ ...form, checkOut: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Status</label>
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg transition"
              >
                {submitting ? 'Recording...' : 'Record Attendance'}
              </button>
            </div>
          </form>
        </div>

        {/* Filter + Search Row */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="w-48">
            <select
              className={inputClass}
              value={filterEmpId}
              onChange={e => setFilterEmpId(e.target.value)}
            >
              <option value="">All employees</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
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
              ) : filtered.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {a.employeeId?.firstName} {a.employeeId?.lastName}
                    <p className="text-xs text-gray-400 font-normal">{a.employeeId?.department}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {a.hoursWorked ? `${a.hoursWorked}h` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(a.status)}`}>
                      {a.status}
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