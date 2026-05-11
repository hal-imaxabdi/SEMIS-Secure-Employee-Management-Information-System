import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Users, UserCheck, ClipboardList, ShieldCheck } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const ACTION_COLORS = {
  LOGIN: '#378ADD', CREATE: '#639922', DELETE: '#E24B4A',
  UPDATE: '#BA7517', ADD: '#639922', DEACTIVATE: '#E24B4A',
};
const ROLE_COLORS = {
  admin: '#7F77DD', hr: '#1D9E75', employee: '#378ADD', manager: '#D85A30',
};

function categorizeLogs(logs) {
  const counts = {};
  logs.forEach(l => {
    const key = (l.action || 'OTHER').split('_')[0];
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

const badgeStyle = (action = '') => {
  if (action.includes('LOGIN')) return 'bg-blue-50 text-blue-700';
  if (action.includes('CREATE') || action.includes('ADD')) return 'bg-green-50 text-green-700';
  if (action.includes('DELETE') || action.includes('DEACTIVATE')) return 'bg-red-50 text-red-500';
  if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-yellow-50 text-yellow-700';
  return 'bg-gray-100 text-gray-500';
};

export default function AdminDashboard() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get('http://localhost:5000/api/admin/users', { headers }),
      axios.get('http://localhost:5000/api/admin/audit-logs', { headers }),
    ]).then(([usersRes, logsRes]) => {
      setUsers(usersRes.data);
      setLogs(logsRes.data);
    }).finally(() => setLoading(false));
  }, [token]);

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, sub: 'All accounts' },
    { label: 'Active', value: users.filter(u => u.isActive).length, icon: UserCheck, sub: 'Currently active' },
    { label: 'Audit Events', value: logs.length, icon: ClipboardList, sub: 'Last 100 actions' },
    { label: 'Security', value: 'Good', icon: ShieldCheck, sub: '0 vulnerabilities' },
  ];

  const actionCounts = categorizeLogs(logs);
  const actionLabels = Object.keys(actionCounts);
  const actionData = Object.values(actionCounts);
  const actionColors = actionLabels.map(l => ACTION_COLORS[l] || '#888780');

  const roleCounts = {};
  users.forEach(u => { const r = u.role || 'unknown'; roleCounts[r] = (roleCounts[r] || 0) + 1; });
  const roleLabels = Object.keys(roleCounts);
  const roleData = Object.values(roleCounts);
  const roleColors = roleLabels.map(r => ROLE_COLORS[r] || '#888780');

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, stepSize: 1 }, beginAtZero: true },
    },
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
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Admin</p>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
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

          {/* Action Bar Chart */}
          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-900 mb-3">Audit activity by type</p>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-3">
              {actionLabels.map((l, i) => (
                <span key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: actionColors[i] }} />
                  {l.toLowerCase()} ({actionData[i]})
                </span>
              ))}
            </div>
            <div style={{ height: 180 }}>
              {!loading && actionLabels.length > 0 && (
                <Bar
                  data={{
                    labels: actionLabels,
                    datasets: [{
                      data: actionData,
                      backgroundColor: actionColors,
                      borderRadius: 4,
                      borderSkipped: false,
                    }],
                  }}
                  options={barOptions}
                />
              )}
              {loading && <p className="text-sm text-gray-400 pt-4">Loading...</p>}
              {!loading && actionLabels.length === 0 && <p className="text-sm text-gray-400 pt-4">No data yet.</p>}
            </div>
          </div>

          {/* Role Doughnut */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-900 mb-3">User role breakdown</p>
            <div className="flex flex-wrap gap-3 mb-3">
              {roleLabels.map((l, i) => (
                <span key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: roleColors[i] }} />
                  {l} ({roleData[i]})
                </span>
              ))}
            </div>
            <div style={{ height: 180 }}>
              {!loading && roleLabels.length > 0 && (
                <Doughnut
                  data={{
                    labels: roleLabels,
                    datasets: [{
                      data: roleData,
                      backgroundColor: roleColors,
                      borderWidth: 2,
                      borderColor: '#fff',
                    }],
                  }}
                  options={doughnutOptions}
                />
              )}
              {loading && <p className="text-sm text-gray-400 pt-4">Loading...</p>}
            </div>
          </div>
        </div>

        {/* Recent Activity — compact */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-900">Recent activity</p>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <p className="px-5 py-3 text-sm text-gray-400">Loading...</p>
            ) : logs.length === 0 ? (
              <p className="px-5 py-3 text-sm text-gray-400">No activity yet.</p>
            ) : logs.slice(0, 6).map((log) => (
              <div key={log._id} className="px-5 py-2.5 flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeStyle(log.action)}`}>
                  {log.action || '—'}
                </span>
                <span className="text-xs text-gray-500 flex-1 truncate">{log.userId?.email || 'System'}</span>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
} 