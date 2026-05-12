import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HRPayroll() {
  const { token } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEmpId, setFilterEmpId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    month: new Date().toISOString().slice(0, 7),
    baseSalary: '',
    allowances: '',
    deductions: '',
  });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchPayrolls = (empId) => {
    const url = empId
      ? `http://localhost:5000/api/hr/payroll/${empId}`
      : 'http://localhost:5000/api/hr/payroll';
    axios.get(url, { headers }).then(res => setPayrolls(res.data)).catch(() => {});
  };

  const fetchData = () => {
    axios.get('http://localhost:5000/api/hr/employees', { headers })
      .then(res => setEmployees(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    fetchPayrolls('');
  }, []);

  useEffect(() => {
    fetchPayrolls(filterEmpId);
  }, [filterEmpId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/hr/payroll', {
        employeeId: form.employeeId,
        month: form.month,
        baseSalary: Number(form.baseSalary),
        allowances: Number(form.allowances) || 0,
        deductions: Number(form.deductions) || 0,
      }, { headers });
      toast.success('Payroll record created');
      setShowModal(false);
      setForm(f => ({ ...f, baseSalary: '', allowances: '', deductions: '', employeeId: '' }));
      fetchPayrolls(filterEmpId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create payroll');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = payrolls.filter(p => {
    const name = `${p.employeeId?.firstName || ''} ${p.employeeId?.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const statusBadge = (status) => {
    if (status === 'processed') return 'bg-emerald-50 text-emerald-700';
    if (status === 'paid') return 'bg-blue-50 text-blue-700';
    return 'bg-amber-50 text-amber-700';
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition";

  const netPreview = (Number(form.baseSalary) || 0) + (Number(form.allowances) || 0) - (Number(form.deductions) || 0);

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">HR</p>
            <h1 className="text-2xl font-semibold text-gray-900">Payroll</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            + New Payroll
          </button>
        </div>

        {/* Filter + Search Row */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="w-52">
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
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Month</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Base Salary</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Allowances</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Deductions</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Net Pay</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-widest text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-6 text-gray-400 text-center">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-6 text-gray-400 text-center">No payroll records found.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="text-gray-800 font-medium">{p.employeeId?.firstName} {p.employeeId?.lastName}</p>
                    <p className="text-xs text-gray-400">{p.employeeId?.department}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.month}</td>
                  <td className="px-6 py-4 text-gray-600">${Number(p.baseSalary || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-emerald-600">+${Number(p.allowances || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-rose-500">-${Number(p.deductions || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-900 font-semibold">${Number(p.netPay || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Payroll Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">New Payroll Record</h2>
            <form onSubmit={handleCreate} className="space-y-4">
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
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Month</label>
                <input
                  required
                  type="month"
                  className={inputClass}
                  value={form.month}
                  onChange={e => setForm({ ...form, month: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Base Salary ($)</label>
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="0"
                  className={inputClass}
                  value={form.baseSalary}
                  onChange={e => setForm({ ...form, baseSalary: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Allowances ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className={inputClass}
                    value={form.allowances}
                    onChange={e => setForm({ ...form, allowances: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest block mb-1">Deductions ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className={inputClass}
                    value={form.deductions}
                    onChange={e => setForm({ ...form, deductions: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-widest">Net Pay</span>
                <span className="text-lg font-semibold text-gray-900">${netPreview.toLocaleString()}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm hover:bg-gray-700 disabled:opacity-50 transition"
                >
                  {submitting ? 'Creating...' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}