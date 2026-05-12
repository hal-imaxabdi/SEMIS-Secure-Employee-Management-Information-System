import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Users, FileText, Calendar, CreditCard } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const DEPT_COLORS = ['#378ADD', '#1D9E75', '#BA7517', '#7F77DD', '#D85A30', '#E24B4A', '#639922'];
const STATUS_COLORS = { approved: '#1D9E75', pending: '#BA7517', rejected: '#E24B4A' };

export default function HRDashboard() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get('http://localhost:5000/api/hr/employees', { headers }),
      axios.get('http://localhost:5000/api/hr/leave', { headers }),
      axios.get('http://localhost:5000/api/hr/attendance', { headers }),
      axios.get('http://localhost:5000/api/hr/payroll', { headers }),
    ]).then(([empRes, leaveRes, attRes, payRes]) => {
      setEmployees(empRes.data);
      setLeaves(leaveRes.data);
      setAttendance(attRes.data);
      setPayrolls(payRes.data);
    }).finally(() => setLoading(false));
  }, [token]);

  // --- Stats ---
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const approvedLeaves = leaves.filter(l => l.status === 'approved').length;
  const rejectedLeaves = leaves.filter(l => l.status === 'rejected').length;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthPayrolls = payrolls.filter(p => p.month === thisMonth).length;
  const todayPresent = attendance.filter(
    a => new Date(a.date).toDateString() === new Date().toDateString() && a.status === 'present'
  ).length;

  const stats = [
    { label: 'Total Employees', value: employees.length, icon: Users, sub: 'Active staff' },
    { label: 'Pending Leaves', value: pendingLeaves, icon: FileText, sub: 'Need your review' },
    { label: "Today's Present", value: todayPresent, icon: Calendar, sub: 'Checked in today' },
    { label: 'Payrolls This Month', value: monthPayrolls, icon: CreditCard, sub: thisMonth },
  ];

  // --- Bar chart: last 7 days attendance ---
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toDateString();
    const present = attendance.filter(a => new Date(a.date).toDateString() === dateStr && a.status === 'present').length;
    const absent = attendance.filter(a => new Date(a.date).toDateString() === dateStr && a.status === 'absent').length;
    const late = attendance.filter(a => new Date(a.date).toDateString() === dateStr && a.status === 'late').length;
    return { label, present, absent, late };
  });

  const barData = {
    labels: last7.map(d => d.label),
    datasets: [
      { label: 'Present', data: last7.map(d => d.present), backgroundColor: '#1D9E75', borderRadius: 4, borderSkipped: false },
      { label: 'Absent', data: last7.map(d => d.absent), backgroundColor: '#E24B4A', borderRadius: 4, borderSkipped: false },
      { label: 'Late', data: last7.map(d => d.late), backgroundColor: '#BA7517', borderRadius: 4, borderSkipped: false },
    ],
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } }, stacked: false },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, stepSize: 1 }, beginAtZero: true },
    },
  };

  // --- Doughnut: department breakdown ---
  const deptCounts = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});
  const deptLabels = Object.keys(deptCounts);
  const deptData = Object.values(deptCounts);
  const deptColors = deptLabels.map((_, i) => DEPT_COLORS[i % DEPT_COLORS.length]);

  const doughnutData = {
    labels: deptLabels,
    datasets: [{
      data: deptData,
      backgroundColor: deptColors,
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '62%',
    plugins: { legend: { display: false } },
  };

  // --- Leave status badge ---
  const leaveBadge = (status) => {
    if (status === 'approved') return 'bg-green-50 text-green-700';
    if (status === 'rejected') return 'bg-red-50 text-red-500';
    return 'bg-yellow-50 text-yellow-700';
  };

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">HR</p>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {stats.map(({ label, value, icon: Icon, sub }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-gray-400">{label}</span>
                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon size={13} className="text-gray-500" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{loading ? '—' : value}</p>
              <p className="text-xs text-gray-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">

          {/* Attendance Bar Chart */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-900 mb-3">Attendance — last 7 days</p>
            <div className="flex flex-wrap gap-3 mb-3">
              {[['Present', '#1D9E75'], ['Absent', '#E24B4A'], ['Late', '#BA7517']].map(([label, color]) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
            <div style={{ height: 180 }}>
              {!loading && <Bar data={barData} options={barOptions} />}
              {loading && <p className="text-sm text-gray-400 pt-4">Loading...</p>}
            </div>
          </div>

          {/* Dept Doughnut */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-900 mb-3">Headcount by department</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {deptLabels.map((l, i) => (
                <span key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: deptColors[i] }} />
                  {l} ({deptData[i]})
                </span>
              ))}
            </div>
            <div style={{ height: 180 }}>
              {!loading && deptLabels.length > 0 && (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              )}
              {loading && <p className="text-sm text-gray-400 pt-4">Loading...</p>}
              {!loading && deptLabels.length === 0 && <p className="text-sm text-gray-400 pt-4">No data yet.</p>}
            </div>
          </div>
        </div>

        {/* Leave Requests — compact */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-900">Recent leave requests</p>
            {pendingLeaves > 0 && (
              <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                {pendingLeaves} pending
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <p className="px-5 py-3 text-sm text-gray-400">Loading...</p>
            ) : leaves.length === 0 ? (
              <p className="px-5 py-3 text-sm text-gray-400">No leave requests yet.</p>
            ) : leaves.slice(0, 6).map((l) => (
              <div key={l._id} className="px-5 py-2.5 flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${leaveBadge(l.status)}`}>
                  {l.status}
                </span>
                <span className="text-xs text-gray-800 flex-1 truncate font-medium">
                  {l.employeeId?.firstName} {l.employeeId?.lastName}
                </span>
                <span className="text-xs text-gray-400 capitalize">{l.type} · {l.days}d</span>
                <span className="text-xs text-gray-400 shrink-0">
                  {l.startDate ? new Date(l.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}