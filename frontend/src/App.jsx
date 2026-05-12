import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import HRDashboard from './pages/HRDashboard';
import HREmployees from './pages/HREmployees';
import HRAttendance from './pages/HRAttendance';
import HRLeave from './pages/HRLeave';
import HRPayroll from './pages/HRPayroll';
import EmployeeDashboard from './pages/EmployeeDashboard';
import MyProfile from './pages/MyProfile';
import MyAttendance from './pages/MyAttendance';
import MyPayslips from './pages/MyPayslips';
import MyLeave from './pages/MyLeave';

// Admin view-only pages (reuse HR pages but read-only via role check)
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import Leave from './pages/Leave';

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'hr') return <HRDashboard />;
  if (user?.role === 'employee') return <EmployeeDashboard />;
  return null;
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

          {/* First login password reset */}
          <Route path="/reset-password" element={
            <ProtectedRoute roles={['admin', 'hr', 'employee']}>
              <ResetPassword />
            </ProtectedRoute>
          } />

          {/* Shared dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['admin', 'hr', 'employee']}>
              <DashboardRouter />
            </ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
          <Route path="/audit-logs" element={<ProtectedRoute roles={['admin']}><AuditLogs /></ProtectedRoute>} />

          {/* Admin view-only pages */}
          <Route path="/employees" element={<ProtectedRoute roles={['admin']}><Employees /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute roles={['admin']}><Attendance /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute roles={['admin']}><Payroll /></ProtectedRoute>} />
          <Route path="/leave" element={<ProtectedRoute roles={['admin']}><Leave /></ProtectedRoute>} />

          {/* HR only */}
          <Route path="/hr/employees" element={<ProtectedRoute roles={['hr']}><HREmployees /></ProtectedRoute>} />
          <Route path="/hr/attendance" element={<ProtectedRoute roles={['hr']}><HRAttendance /></ProtectedRoute>} />
          <Route path="/hr/payroll" element={<ProtectedRoute roles={['hr']}><HRPayroll /></ProtectedRoute>} />
          <Route path="/hr/leave" element={<ProtectedRoute roles={['hr']}><HRLeave /></ProtectedRoute>} />

          {/* Employee only */}
          <Route path="/my-profile" element={<ProtectedRoute roles={['employee']}><MyProfile /></ProtectedRoute>} />
          <Route path="/my-attendance" element={<ProtectedRoute roles={['employee']}><MyAttendance /></ProtectedRoute>} />
          <Route path="/my-leave" element={<ProtectedRoute roles={['employee']}><MyLeave /></ProtectedRoute>} />
          <Route path="/my-payslips" element={<ProtectedRoute roles={['employee']}><MyPayslips /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;