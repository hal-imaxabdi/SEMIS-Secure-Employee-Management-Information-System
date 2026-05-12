import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Calendar, FileText, CreditCard, User } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const LEAVE_COLORS = { approved: '#1D9E75', pending: '#BA7517', rejected: '#E24B4A' };
const ATT_COLORS = { present: '#1D9E75', late: '#BA7517', absent: '#E24B4A' };

const leaveBadge = (status) => {
  if (status === 'approved') return 'bg-green-50 text-green-700';
  if (status === 'rejected') return 'bg-red-50 text-red-500';
  return 'bg-yellow-50 text-yellow-700';
};

export default function EmployeeDashboard() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get('http://localhost:5000/api/employee/profile', { headers }),
      axios.get('http://localhost:5000/api/employee/attendance', { headers }),
      axios.get('http://localhost:5000/api/employee/leave', { headers }),
      axios.get('http://localhost:5000/api/employee/payroll', { headers }),
    ]).then(([profRes, attRes, leaveRes, payRes]) => {
      setProfile(profRes.data);
      setAttendance(attRes.data);
      setLeaves(leaveRes.data);
      setPayrolls(payRes.data);
    }).finally(() => setLoading(false));
  }, [token]);

  // Stats
  const present = attendance.filter(r => r.status === 'present').length;
  const late = attendance.filter(r => r.status === 'late').length;
  const absent = attendance.filter(r => r.status === 'absent').length;
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const processedPayrolls = payrolls.filter(p => p.status === 'processed').length;

  const stats = [
    { label: 'Days Present', value: present, icon: Calendar, sub: 'All time' },
    { label: 'Days Late', value: late, icon: Calendar, sub: 'All time' },
    { label: 'Leave Requests', value: leaves.length, icon: FileText, sub: `${pendingLeaves} pending` },
    { label: 'Payslips', value: processedPayrolls, icon: CreditCard, sub: 'Processed' },
  ];

  // Bar chart — last 7 days attendance
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toDateString();
    return {
      label,
      present: attendance.filter(a => new Date(a.date).toDateString() === dateStr && a.status === 'present').length,
      absent: attendance.filter(a => new Date(a.date).toDateString() === dateStr && a.status === 'absent').length,
      late: attendance.filter(a => new Date(a.date).toDateString() === dateStr && a.status === 'late').length,
    };
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
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, stepSize: 1 }, beginAtZero: true },
    },
  };

  // Doughnut — leave status breakdown
  const leaveStatusCounts = { approved: 0, pending: 0, rejected: 0 };
  leaves.forEach(l => { if (leaveStatusCounts[l.status] !== undefined) leaveStatusCounts[l.status]++; });
  const leaveLabels = Object.keys(leaveStatusCounts);
  const leaveData = Object.values(leaveStatusCounts);
  const leaveColors = leaveLabels.map(l => LEAVE_COLORS[l]);

  const doughnutData = {
    labels: leaveLabels,
    datasets: [{ data: leaveData, backgroundColor: leaveColors, borderWidth: 2, borderColor: '#fff' }],
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '62%',
    plugins: { legend: { display: false } },
  };

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Employee</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            {loading ? 'Dashboard' : `Welcome back, ${profile?.firstName} 👋`}
          </h1>
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
            <p className="text-xs font-medium text-gray-900 mb-3">My attendance — last 7 days</p>
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

          {/* Leave Doughnut */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-900 mb-3">Leave request status</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {leaveLabels.map((l, i) => (
                <span key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: leaveColors[i] }} />
                  {l} ({leaveData[i]})
                </span>
              ))}
            </div>
            <div style={{ height: 180 }}>
              {!loading && leaves.length > 0 && (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              )}
              {loading && <p className="text-sm text-gray-400 pt-4">Loading...</p>}
              {!loading && leaves.length === 0 && <p className="text-sm text-gray-400 pt-4">No leave requests yet.</p>}
            </div>
          </div>
        </div>

        {/* Recent Payslips — compact */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-900">Recent payslips</p>
            {processedPayrolls > 0 && (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {processedPayrolls} processed
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <p className="px-5 py-3 text-sm text-gray-400">Loading...</p>
            ) : payrolls.length === 0 ? (
              <p className="px-5 py-3 text-sm text-gray-400">No payslips yet.</p>
            ) : payrolls.slice(0, 5).map(p => (
              <div key={p._id} className="px-5 py-2.5 flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'processed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {p.status}
                </span>
                <span className="text-xs text-gray-800 flex-1 font-medium">{p.month}</span>
                <span className="text-xs text-gray-400">
                  Allowances: {p.allowances != null ? `$${p.allowances.toLocaleString()}` : '—'}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  Deductions: {p.deductions != null ? `$${p.deductions.toLocaleString()}` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}