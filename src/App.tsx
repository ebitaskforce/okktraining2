import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Views
import { LandingPage } from './views/LandingPage';
import { Login } from './views/auth/Login';
import { Register } from './views/auth/Register';
import { AdminLogin } from './views/auth/AdminLogin';
import { ResetPassword } from './views/auth/ResetPassword';

// User Portal
import { UserDashboard } from './views/user/UserDashboard';
import { UserSessionsPage } from './views/user/UserSessionsPage';
import { UserCalendarPage } from './views/user/UserCalendarPage';
import { UserBookingsPage } from './views/user/UserBookingsPage';

// Admin Portal
import { AdminDashboard } from './views/admin/AdminDashboard';
import { SessionManagement } from './views/admin/SessionManagement';
import { ApprovalPage } from './views/admin/ApprovalPage';
import { AttendancePage } from './views/admin/AttendancePage';
import { UserManagementPage } from './views/admin/UserManagementPage';
import { TrainerManagementPage } from './views/admin/TrainerManagementPage';
import { ReportsPage } from './views/admin/ReportsPage';
import { AuditLogPage } from './views/admin/AuditLogPage';
import { SettingsPage } from './views/admin/SettingsPage';

// Route Guards
const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected User Portal Routes */}
              <Route path="/dashboard" element={<UserRoute><UserDashboard /></UserRoute>} />
              <Route path="/dashboard/sessions" element={<UserRoute><UserSessionsPage /></UserRoute>} />
              <Route path="/dashboard/calendar" element={<UserRoute><UserCalendarPage /></UserRoute>} />
              <Route path="/dashboard/history" element={<UserRoute><UserBookingsPage /></UserRoute>} />

              {/* Protected Admin Portal Routes */}
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/sessions" element={<AdminRoute><SessionManagement /></AdminRoute>} />
              <Route path="/admin/approvals" element={<AdminRoute><ApprovalPage /></AdminRoute>} />
              <Route path="/admin/attendance" element={<AdminRoute><AttendancePage /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
              <Route path="/admin/trainers" element={<AdminRoute><TrainerManagementPage /></AdminRoute>} />
              <Route path="/admin/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
              <Route path="/admin/audit" element={<AdminRoute><AuditLogPage /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
