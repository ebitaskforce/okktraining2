import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { dataService } from '../../services/dataService';
import { TrainingSession, Booking } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { SessionCard } from '../../components/sessions/SessionCard';
import { SessionDetailsModal } from '../../components/sessions/SessionDetailsModal';
import { TicketQRModal } from '../../components/bookings/TicketQRModal';
import { 
  Calendar as CalendarIcon, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  ArrowRight,
  Sun,
  Bell
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allSessions, allBookings] = await Promise.all([
        dataService.getSessions(),
        dataService.getBookings()
      ]);
      setSessions(allSessions);
      if (user) {
        setUserBookings(allBookings.filter(b => b.user_id === user.id));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleBook = async (session: TrainingSession) => {
    if (!user) return;
    try {
      const res = await dataService.bookSession(user.id, session.id);
      if (res.waitlist) {
        showToast(`Session is full. Added to Waitlist at Position #${res.waitlist.position}!`, 'warning');
      } else {
        showToast('Booking submitted successfully! Pending admin approval.', 'success');
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Booking failed', 'error');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const availableToday = sessions.filter(s => s.session_date >= todayStr && s.status !== 'cancelled');
  const activeBookings = userBookings.filter(b => b.status === 'approved' || b.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-fade-in">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-white/20 backdrop-blur-md">
              Staff Portal • {user?.department}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {user?.full_name}!</h1>
            <p className="text-xs sm:text-sm opacity-90 max-w-xl">
              Staff ID: <strong className="font-mono">{user?.staff_id}</strong> | You have <strong>{userBookings.filter(b => b.status === 'pending').length}</strong> pending booking requests and <strong>{userBookings.filter(b => b.status === 'approved').length}</strong> approved tickets.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 relative z-10">
            <button
              onClick={() => navigate('/dashboard/sessions')}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-md hover:bg-slate-100 transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              Browse Courses
            </button>
            <button
              onClick={() => navigate('/dashboard/calendar')}
              className="px-4 py-2.5 rounded-xl bg-blue-900/40 text-white border border-white/20 font-bold text-xs hover:bg-blue-900/60 transition-all flex items-center gap-1.5"
            >
              <CalendarIcon className="w-4 h-4" />
              View Calendar
            </button>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Pending Approval</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {userBookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Approved Bookings</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {userBookings.filter(b => b.status === 'approved').length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Rejected / Cancelled</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {userBookings.filter(b => b.status === 'rejected' || b.status === 'cancelled').length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Active Passes</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {userBookings.filter(b => b.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Upcoming Approved Tickets & Available Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Available Sessions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Available Training Courses Today
              </h2>
              <button
                onClick={() => navigate('/dashboard/sessions')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Explore All
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableToday.slice(0, 4).map(s => {
                const isBooked = userBookings.some(b => b.session_id === s.id && b.status !== 'cancelled');
                return (
                  <SessionCard
                    key={s.id}
                    session={s}
                    isBooked={isBooked}
                    onSelect={sess => setSelectedSession(sess)}
                    onBook={sess => handleBook(sess)}
                  />
                );
              })}
            </div>
          </div>

          {/* Right Col: Approved Passes & Quick Status */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-500" />
                Active Attendance Passes
              </h3>

              {userBookings.filter(b => b.status === 'approved').length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No approved passes yet. Book a session to receive your QR ticket.
                </p>
              ) : (
                <div className="space-y-3">
                  {userBookings.filter(b => b.status === 'approved').map(b => (
                    <div 
                      key={b.id} 
                      className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{b.session_title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                          APPROVED
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">{b.session_date} ({b.session_type?.toUpperCase()})</p>
                      <button
                        onClick={() => setQrBooking(b)}
                        className="w-full py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View QR Code Ticket
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <SessionDetailsModal
        isOpen={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
        onBook={sess => handleBook(sess)}
        isBooked={userBookings.some(b => b.session_id === selectedSession?.id && b.status !== 'cancelled')}
      />

      <TicketQRModal
        isOpen={Boolean(qrBooking)}
        onClose={() => setQrBooking(null)}
        booking={qrBooking}
      />
    </div>
  );
};
