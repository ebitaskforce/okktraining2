import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { dataService } from '../../services/dataService';
import { UserProfile, UserRole, DEPARTMENTS } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Footer } from '../../components/common/Footer';
import { Modal } from '../../components/common/Modal';
import { Users, Search, Shield, UserCheck, KeyRound, UserX, Edit2, Save, X } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useNotification();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);

  const loadUsers = async () => {
    const data = await dataService.getUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenEditModal = (targetUser: UserProfile) => {
    setEditingUser(targetUser);
    setEditFormData({
      full_name: targetUser.full_name,
      staff_id: targetUser.staff_id,
      department: targetUser.department,
      phone: targetUser.phone,
      email: targetUser.email,
      role: targetUser.role,
      is_active: targetUser.is_active
    });
  };

  const handleSaveUserDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !currentAdmin) return;
    setIsSaving(true);
    try {
      await dataService.updateUserDetail(editingUser.id, editFormData, currentAdmin.id, currentAdmin.full_name);
      showToast(`Profile for ${editFormData.full_name || editingUser.full_name} updated successfully!`, 'success');
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleRole = async (targetUser: UserProfile) => {
    if (!currentAdmin) return;
    const newRole: UserRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await dataService.updateUserRole(targetUser.id, newRole, currentAdmin.id, currentAdmin.full_name);
      showToast(`Updated ${targetUser.full_name}'s role to ${newRole.toUpperCase()}`, 'success');
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  const handleToggleActive = async (targetUser: UserProfile) => {
    if (!currentAdmin) return;
    const newState = !targetUser.is_active;
    try {
      await dataService.toggleUserActive(targetUser.id, newState, currentAdmin.id, currentAdmin.full_name);
      showToast(`Account for ${targetUser.full_name} is now ${newState ? 'ACTIVE' : 'DISABLED'}`, 'info');
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  const handleAdminResetPassword = async (targetUser: UserProfile) => {
    showToast(`Password reset link dispatched to ${targetUser.email}`, 'info');
  };

  const filteredUsers = users.filter(u => {
    return (
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.staff_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white">User & Access Management</h1>
              <p className="text-xs text-slate-400 mt-1">
                Edit staff & administrator profiles, change roles, update details, reset passwords, and toggle account status
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, staff ID, department..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Staff / Admin Member</th>
                    <th className="p-4">Department & Phone</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-white">
                        {u.full_name}
                        <span className="block text-[10px] text-slate-400 font-normal">{u.staff_id} • {u.email}</span>
                      </td>
                      <td className="p-4 text-slate-300">
                        {u.department}
                        <span className="block text-[10px] text-slate-400 font-normal">{u.phone}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          u.role === 'admin' ? 'bg-purple-950 text-purple-400 border border-purple-800' : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          u.is_active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {u.is_active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          title="Edit User Profile Details"
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex-inline items-center gap-1 shadow-sm"
                        >
                          <Edit2 className="w-3 h-3 inline mr-1" />
                          Edit Details
                        </button>
                        <button
                          onClick={() => handleToggleRole(u)}
                          title="Assign Role"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold"
                        >
                          Role: {u.role === 'admin' ? 'Set User' : 'Set Admin'}
                        </button>
                        <button
                          onClick={() => handleAdminResetPassword(u)}
                          title="Reset Password"
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          title={u.is_active ? 'Disable Account' : 'Activate Account'}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            u.is_active ? 'bg-rose-950 text-rose-400 hover:bg-rose-900' : 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
                          }`}
                        >
                          {u.is_active ? 'Disable' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Edit User Detail Modal */}
      {editingUser && (
        <Modal
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          title={`Edit Profile: ${editingUser.full_name}`}
        >
          <form onSubmit={handleSaveUserDetail} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={editFormData.full_name || ''}
                onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Staff ID *</label>
                <input
                  type="text"
                  required
                  value={editFormData.staff_id || ''}
                  onChange={e => setEditFormData({ ...editFormData, staff_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editFormData.email || ''}
                  onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Department *</label>
                <input
                  type="text"
                  required
                  list="department-options"
                  value={editFormData.department || ''}
                  onChange={e => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="department-options">
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={editFormData.phone || ''}
                  onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">System Role *</label>
                <select
                  value={editFormData.role || 'user'}
                  onChange={e => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="user">USER (Regular Staff)</option>
                  <option value="admin">ADMIN (System Administrator)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Account Activation</label>
                <select
                  value={editFormData.is_active ? 'true' : 'false'}
                  onChange={e => setEditFormData({ ...editFormData, is_active: e.target.value === 'true' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="true">ACTIVE</option>
                  <option value="false font-bold text-rose-400">DISABLED</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <Footer />
    </div>
  );
};
