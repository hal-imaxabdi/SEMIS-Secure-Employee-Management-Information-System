import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import HRDashboard from './pages/HRDashboard';
import HREmployees from './pages/HREmployees';
import HRAttendance from './pages/HRAttendance';
import HRLeave from './pages/HRLeave';
import HRPayroll from './pages/HRPayroll';

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'hr') return <HRDashboard />;
  return <div className="p-8 text-gray-500">Employee dashboard coming soon.</div>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Shared */}
          <Route path="/dashboard" element={<ProtectedRoute roles={['admin','hr','employee']}><DashboardRouter /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
          <Route path="/audit-logs" element={<ProtectedRoute roles={['admin']}><AuditLogs /></ProtectedRoute>} />

          {/* HR + Admin */}
          <Route path="/employees" element={<ProtectedRoute roles={['admin','hr']}><HREmployees /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute roles={['admin','hr']}><HRAttendance /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute roles={['admin','hr']}><HRPayroll /></ProtectedRoute>} />
          <Route path="/leave" element={<ProtectedRoute roles={['admin','hr']}><HRLeave /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;