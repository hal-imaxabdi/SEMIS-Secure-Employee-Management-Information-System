import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import Leave from './pages/Leave';
import AuditLogs from './pages/AuditLogs';

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  return <div className="p-8 text-gray-500">Dashboard for {user?.role} coming soon.</div>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['admin', 'hr', 'employee']}>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute roles={['admin', 'hr']}>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute roles={['admin', 'hr']}>
                <Attendance />
              </ProtectedRoute>
            }
          />  
          <Route
            path="/payroll"
            element={
              <ProtectedRoute roles={['admin', 'hr']}>
                <Payroll />
              </ProtectedRoute>
            }
          />    
          <Route
            path="/leave"
            element={
              <ProtectedRoute roles={['admin', 'hr']}>
                <Leave />
              </ProtectedRoute>
            }
          />  
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute roles={['admin']}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />  
          {/* Add more routes as needed */} 
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;