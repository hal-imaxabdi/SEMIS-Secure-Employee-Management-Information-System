import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { UserPlus, Shield, UserCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '', role: 'employee', firstName: '', lastName: '',
    department: 'Engineering', jobTitle: '', hireDate: ''
  });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = () => {
    axios.get('http://localhost:5000/api/admin/users', { headers })
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/admin/users', form, { headers });
      toast.success('User created successfully');
      setShowModal(false);
      setForm({ email: '', role: 'employee', firstName: '', lastName: '', department: 'Engineering', jobTitle: '', hireDate: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}/deactivate`, {}, { headers });
      toast.success('User deactivated');
      fetchUsers();
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  const roleBadge = (role) => {
    if (role === 'admin') return 'bg-blue-50 text-blue-600';
    if (role === 'hr') return 'bg-green-50 text-green-700';
    return 'bg-gray-100 text-gray-600';
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition";

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Admin</p>
            <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            <UserPlus size={15} />
            New User
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">User</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Role</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Last Login</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-6 text-gray-400 text-center">No users found.</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User size={14} className="text-gray-500" />
                      </div>
                      <span className="text-gray-800">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleBadge(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    {u.isActive && (
                      <button
                        onClick={() => handleDeactivate(u._id)}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Create New User</h2>
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
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Role</label>
                  <select className={inputClass} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Department</label>
                  <select className={inputClass} value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                    {['Engineering','Product','DevOps','Sales','Finance','HR','Legal'].map(d => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Job Title</label>
                <input required className={inputClass} value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Hire Date</label>
                <input required type="date" className={inputClass} value={form.hireDate} onChange={e => setForm({...form, hireDate: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50 transition">
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}