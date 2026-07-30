import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { dataService } from '../../services/dataService';
import { Booking } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { TicketQRModal } from '../../components/bookings/TicketQRModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { QrCode, XCircle, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

export const UserBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const loadData = async () => {
    if (!user) return;
    const all = await dataService.getBookings();
    setBookings(all.filter(b => b.user_id === user.id));
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCancelBooking = async () => {
    if (!cancelTarget || !user) return;
    try {
      await dataService.updateBookingStatus(cancelTarget.id, 'cancelled', 'Cancelled by applicant before approval', user.id, user.full_name);
      showToast('Booking cancelled successfully.', 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Booking History</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track status of your submitted training session applications and access attendance tickets
          </p>
        </div>

        {/* Bookings Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-base font-semibold text-slate-600 dark:text-slate-300">No booking requests found</p>
              <p className="text-xs">Browse available courses to submit a booking.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Training Title</th>
                    <th className="p-4">Session Date</th>
                    <th className="p-4">Slot</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Booking Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {b.session_title}
                        <span className="block text-[11px] font-normal text-slate-400">{b.venue}</span>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">{b.session_date}</td>
                      <td className="p-4">
                        <span className="capitalize font-semibold">{b.session_type}</span>
                      </td>
                      <td className="p-4">
                        {b.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            PENDING APPROVAL
                          </span>
                        )}
                        {b.status === 'approved' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            APPROVED
                          </span>
                        )}
                        {b.status === 'rejected' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                            REJECTED
                          </span>
                        )}
                        {b.status === 'cancelled' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                            CANCELLED
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {new Date(b.booking_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {b.status === 'approved' && (
                          <button
                            onClick={() => setQrBooking(b)}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1 shadow-xs"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            QR Ticket Pass
                          </button>
                        )}
                        {b.status === 'pending' && (
                          <button
                            onClick={() => setCancelTarget(b)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel Request
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <TicketQRModal
        isOpen={Boolean(qrBooking)}
        onClose={() => setQrBooking(null)}
        booking={qrBooking}
      />

      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelBooking}
        title="Cancel Booking Request"
        message={`Are you sure you want to cancel your booking request for "${cancelTarget?.session_title}"?`}
        isDanger={true}
        confirmText="Cancel Booking"
      />
    </div>
  );
};
