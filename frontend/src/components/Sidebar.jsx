import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, CreditCard,
  Calendar, FileText, ClipboardList, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';

const navItems = {
 admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Users', icon: Users, path: '/users' },
    { label: 'Employees', icon: UserCheck, path: '/employees' },
    { label: 'Attendance', icon: Calendar, path: '/attendance' },
    { label: 'Payroll', icon: CreditCard, path: '/payroll' },
    { label: 'Leave', icon: FileText, path: '/leave' },
    { label: 'Audit Logs', icon: ClipboardList, path: '/audit-logs' },
  ],
  hr: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Employees', icon: UserCheck, path: '/employees' },
    { label: 'Attendance', icon: Calendar, path: '/attendance' },
    { label: 'Payroll', icon: CreditCard, path: '/payroll' },
    { label: 'Leave', icon: FileText, path: '/leave' },
  ],
  employee: [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'My Profile', icon: UserCheck, path: '/my-profile' },
  { label: 'My Attendance', icon: Calendar, path: '/my-attendance' },
  { label: 'My Payslips', icon: CreditCard, path: '/my-payslips' },
  { label: 'My Leave', icon: FileText, path: '/my-leave' },
],
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`relative flex flex-col bg-[#0a0a0a] border-r border-white/[0.06] transition-all duration-300 ${collapsed ? 'w-[64px]' : 'w-[220px]'} min-h-screen`}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
        <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center shrink-0">
          <span className="text-black text-xs font-bold">S</span>
        </div>
        {!collapsed && (
          <span className="text-white text-sm font-semibold tracking-wide">SEMIS</span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {items.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                ${active
                  ? 'bg-white text-black font-medium'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.07]'
                }`}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Role Badge + Logout */}
      <div className="px-2 py-4 border-t border-white/[0.06] space-y-1">
        {!collapsed && (
          <div className="px-3 py-1.5 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-white/20">{user?.role}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/[0.07] transition"
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-[#1a1a1a] border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>
  );
}