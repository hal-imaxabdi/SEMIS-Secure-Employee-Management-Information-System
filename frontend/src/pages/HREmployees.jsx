import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Search, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HREmployees() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const [addForm, setAddForm] = useState({
    firstName: '', lastName: '', email: '',
    role: 'employee', department: 'Engineering',
    jobTitle: '', hireDate: '',
  });

  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', department: 'Engineering',
    jobTitle: '', phone: '', address: '', hireDate: '',
  });

  const headers = { Authorization: `Bearer ${token}` };
  const deptOptions = ['Engineering', 'Product', 'DevOps', 'Sales', 'Finance', 'HR', 'Legal'];
  const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition";

  const fetchEmployees = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/hr/employees', { headers })
      .then(res => setEmployees(res.data))
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/hr/employees', addForm, { headers });
      toast.success(`Employee created! Temp password: ${res.data.tempPassword}`);
      setShowAddModal(false);
      setAddForm({ firstName: '', lastName: '', email: '', role: 'employee', department: 'Engineering', jobTitle: '', hireDate: '' });
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.put(`http://localhost:5000/api/hr/employees/${selectedEmp._id}`, editForm, { headers });
      toast.success('Employee updated');
      setShowEditModal(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id) => {
    if (!confirm('Archive this employee? They will no longer appear as active.')) return;
    try {
      await axios.put(`http://localhost:5000/api/hr/employees/${id}/archive`, {}, { headers });
      toast.success('Employee archived');
      fetchEmployees();
    } catch {
      toast.error('Failed to archive employee');
    }
  };

  const openEdit = (emp) => {
    setSelectedEmp(emp);
    setEditForm({
      firstName: emp.firstName, lastName: emp.lastName,
      department: emp.department, jobTitle: emp.jobTitle,
      phone: emp.phone || '', address: emp.address || '',
      hireDate: emp.hireDate ? emp.hireDate.slice(0, 10) : '',
    });
    setShowEditModal(true);
  };

  const filtered = employees.filter(emp => {
    const name = `${emp.firstName} ${emp.lastName} ${emp.department} ${emp.jobTitle}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <Layout>
      <div className="p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">HR</p>
            <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            <UserPlus size={15} />
            Add Employee
          </button>
        </div>

        <div className="relative mb-5 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Employee</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Department</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Job Title</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Hire Date</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-6 text-gray-400 text-center">No employees found.</td></tr>
              ) : filtered.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="text-gray-800 font-medium">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-gray-400">{emp.employeeId}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{emp.department}</td>
                  <td className="px-6 py-4 text-gray-600">{emp.jobTitle}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${emp.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(emp)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 transition font-medium"
                      >
                        Edit
                      </button>
                      {emp.status === 'active' && (
                        <button
                          onClick={() => handleArchive(emp._id)}
                          className="text-xs text-red-400 hover:text-red-600 transition font-medium"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Add New Employee</h2>
            <p className="text-xs text-gray-400 mb-5">Creates a login account and employee profile in one step.</p>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">First Name</label>
                  <input required className={inputClass} value={addForm.firstName}
                    onChange={e => setAddForm({ ...addForm, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Last Name</label>
                  <input required className={inputClass} value={addForm.lastName}
                    onChange={e => setAddForm({ ...addForm, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Email</label>
                <input required type="email" className={inputClass} value={addForm.email}
                  onChange={e => setAddForm({ ...addForm, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Role</label>
                  <select className={inputClass} value={addForm.role}
                    onChange={e => setAddForm({ ...addForm, role: e.target.value })}>
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Department</label>
                  <select className={inputClass} value={addForm.department}
                    onChange={e => setAddForm({ ...addForm, department: e.target.value })}>
                    {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Job Title</label>
                <input required className={inputClass} value={addForm.jobTitle}
                  onChange={e => setAddForm({ ...addForm, jobTitle: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Hire Date</label>
                <input required type="date" className={inputClass} value={addForm.hireDate}
                  onChange={e => setAddForm({ ...addForm, hireDate: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50 transition">
                  {submitting ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {showEditModal && selectedEmp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Edit Employee</h2>
            <p className="text-xs text-gray-400 mb-5">{selectedEmp.firstName} {selectedEmp.lastName} · {selectedEmp.employeeId}</p>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">First Name</label>
                  <input required className={inputClass} value={editForm.firstName}
                    onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Last Name</label>
                  <input required className={inputClass} value={editForm.lastName}
                    onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Department</label>
                  <select className={inputClass} value={editForm.department}
                    onChange={e => setEditForm({ ...editForm, department: e.target.value })}>
                    {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Job Title</label>
                  <input required className={inputClass} value={editForm.jobTitle}
                    onChange={e => setEditForm({ ...editForm, jobTitle: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Phone</label>
                  <input className={inputClass} value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Hire Date</label>
                  <input type="date" className={inputClass} value={editForm.hireDate}
                    onChange={e => setEditForm({ ...editForm, hireDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Address</label>
                <input className={inputClass} value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50 transition">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
}