import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { dataService } from '../../services/dataService';
import { Booking } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Footer } from '../../components/common/Footer';
import { ApprovalModal } from '../../components/bookings/ApprovalModal';
import { CheckCircle, XCircle, Search, Filter, CheckSquare, XSquare, User } from 'lucide-react';

export const ApprovalPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const loadBookings = async () => {
    const data = await dataService.getBookings();
    setBookings(data);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleApprove = async (bookingId: string, notes: string) => {
    if (!user) return;
    try {
      await dataService.updateBookingStatus(bookingId, 'approved', notes, user.id, user.full_name);
      showToast('Booking request APPROVED.', 'success');
      loadBookings();
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  const handleReject = async (bookingId: string, notes: string) => {
    if (!user) return;
    try {
      await dataService.updateBookingStatus(bookingId, 'rejected', notes, user.id, user.full_name);
      showToast('Booking request REJECTED.', 'info');
      loadBookings();
    } catch (err: any) {
      showToast(err.message || 'Rejection failed', 'error');
    }
  };

  const handleBulkApprove = async () => {
    if (!user || selectedIds.length === 0) return;
    for (const id of selectedIds) {
      await dataService.updateBookingStatus(id, 'approved', 'Bulk approved by Admin', user.id, user.full_name);
    }
    showToast(`Bulk approved ${selectedIds.length} requests.`, 'success');
    setSelectedIds([]);
    loadBookings();
  };

  const handleBulkReject = async () => {
    if (!user || selectedIds.length === 0) return;
    for (const id of selectedIds) {
      await dataService.updateBookingStatus(id, 'rejected', 'Bulk rejected by Admin', user.id, user.full_name);
    }
    showToast(`Bulk rejected ${selectedIds.length} requests.`, 'info');
    setSelectedIds([]);
    loadBookings();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filtered = bookings.filter(b => {
    const matchesSearch = 
      (b.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.staff_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.session_title || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
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
              <h1 className="text-2xl font-extrabold text-white">Booking Approvals Queue</h1>
              <p className="text-xs text-slate-400 mt-1">
                Validate staff session requests, inspect department quotas, and issue attendance tickets
              </p>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkApprove}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Approve Selected ({selectedIds.length})
                </button>
                <button
                  onClick={handleBulkReject}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1"
                >
                  <XSquare className="w-3.5 h-3.5" />
                  Reject Selected ({selectedIds.length})
                </button>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search staff, ID, department, course..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none text-xs"
            >
              <option value="pending">Pending Approval Only</option>
              <option value="approved">Approved Requests</option>
              <option value="rejected">Rejected Requests</option>
              <option value="all">All Bookings</option>
            </select>
          </div>

          {/* Bookings Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filtered.length && filtered.length > 0}
                        onChange={e => {
                          if (e.target.checked) setSelectedIds(filtered.map(b => b.id));
                          else setSelectedIds([]);
                        }}
                      />
                    </th>
                    <th className="p-4">Applicant Staff</th>
                    <th className="p-4">Training Session</th>
                    <th className="p-4">Date & Slot</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Submitted Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(b.id)}
                          onChange={() => toggleSelect(b.id)}
                        />
                      </td>
                      <td className="p-4 font-bold text-white">
                        {b.user_name}
                        <span className="block text-[10px] text-slate-400 font-normal">{b.staff_id} • {b.department}</span>
                      </td>
                      <td className="p-4 text-slate-300 font-semibold">
                        {b.session_title}
                        <span className="block text-[10px] text-slate-400 font-normal">{b.venue}</span>
                      </td>
                      <td className="p-4 text-slate-300">
                        {b.session_date}
                        <span className="block text-[10px] font-bold uppercase text-blue-400">{b.session_type}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                          b.status === 'pending' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          b.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          b.status === 'rejected' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(b.booking_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors"
                        >
                          Review & Action
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

      <Footer />

      <ApprovalModal
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
