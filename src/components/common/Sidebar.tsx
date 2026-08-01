import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Shield,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('okk_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('okk_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

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
    <aside 
      className={`fixed lg:static inset-y-0 left-0 z-30 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16 sm:w-20' : 'w-64'
      } ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Mobile Close */}
      <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-800">
        <span className="font-bold text-white text-sm">Admin Command Center</span>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Header & Collapse/Expand Toggle Button */}
      <div className={`p-3 border-b border-slate-800/80 hidden lg:flex items-center justify-between ${
        isCollapsed ? 'flex-col gap-2' : ''
      }`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 truncate">
              Admin Command Center
            </span>
          </div>
        )}
        
        {isCollapsed && (
          <div className="mx-auto pt-1" title="Admin Command Center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
        )}

        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 sm:p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isCollapsed ? 'justify-center px-0' : ''
                } ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Version */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        {isCollapsed ? 'v2.6' : 'GovTech System v2.6 Pro'}
      </div>
    </aside>
  );
};
