import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  QrCode, 
  Users, 
  UserCheck, 
  BarChart3, 
  FileText, 
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const navItems = [
    { label: 'Overview Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Training Sessions', path: '/admin/sessions', icon: Calendar },
    { label: 'Booking Approvals', path: '/admin/approvals', icon: CheckSquare },
    { label: 'Attendance & QR Check-in', path: '/admin/attendance', icon: QrCode },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Trainer Profiles', path: '/admin/trainers', icon: UserCheck },
    { label: 'Reports & Export', path: '/admin/reports', icon: BarChart3 },
    { label: 'Audit Logs', path: '/admin/audit', icon: FileText },
    { label: 'Org Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Mobile Close */}
      <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-800">
        <span className="font-bold text-white text-sm">Admin Navigation</span>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-slate-800/80 hidden lg:block">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin Command Center</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        GovTech System v2.6 Pro
      </div>
    </aside>
  );
};
