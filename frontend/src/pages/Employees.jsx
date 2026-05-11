import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { UserPlus, User, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Employees() {
  const { token, user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', department: 'Engineering',
    jobTitle: '', phone: '', hireDate: '', nationalId: '', address: ''
  });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchEmployees = () => {
    axios.get('http://localhost:5000/api/hr/employees', { headers })
      .then(res => setEmployees(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/hr/employees', form, { headers });
      toast.success('Employee added successfully');
      setShowModal(false);
      setForm({ firstName: '', lastName: '', email: '', department: 'Engineering', jobTitle: '', phone: '', hireDate: '', nationalId: '', address: '' });
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName} ${emp.department} ${emp.jobTitle}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition";

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
              {user?.role?.toUpperCase()}
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          </div>
          {user?.role !== 'admin' && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition"
            >
              <UserPlus size={15} />
              Add Employee
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, department, title..."
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
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Name</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Department</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Job Title</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Hire Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-6 text-gray-400 text-center">No employees found.</td></tr>
              ) : filtered.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <User size={14} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-400">{emp.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{emp.department}</td>
                  <td className="px-6 py-4 text-gray-600">{emp.jobTitle}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${emp.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal — HR only */}
      {showModal && user?.role !== 'admin' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Add Employee</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">First Name</label>
                  <input required className={inputClass} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Last Name</label>
                  <input required className={inputClass} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Email</label>
                <input required type="email" className={inputClass} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Department</label>
                  <select className={inputClass} value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    {['Engineering','Product','DevOps','Sales','Finance','HR','Legal'].map(d => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Job Title</label>
                  <input required className={inputClass} value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Phone</label>
                  <input className={inputClass} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Hire Date</label>
                  <input required type="date" className={inputClass} value={form.hireDate} onChange={e => setForm({...form, hireDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">National ID</label>
                <input className={inputClass} value={form.nationalId} onChange={e => setForm({...form, nationalId: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Address</label>
                <input className={inputClass} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50 transition">
                  {submitting ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}