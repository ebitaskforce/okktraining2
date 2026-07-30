import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { dataService } from '../../services/dataService';
import { TrainingSession, Booking } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { SessionCalendar } from '../../components/calendar/SessionCalendar';
import { SessionDetailsModal } from '../../components/sessions/SessionDetailsModal';

export const UserCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);

  const loadData = async () => {
    const [allSessions, allBookings] = await Promise.all([
      dataService.getSessions(),
      dataService.getBookings()
    ]);
    setSessions(allSessions);
    if (user) {
      setUserBookings(allBookings.filter(b => b.user_id === user.id));
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
        showToast(`Session full. Added to Waitlist (Position #${res.waitlist.position})!`, 'warning');
      } else {
        showToast('Booking submitted successfully! Pending approval.', 'success');
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Booking failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Training Schedule Calendar</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual calendar view for morning and afternoon training slots. Click any slot to view details and book.
          </p>
        </div>

        <SessionCalendar
          sessions={sessions}
          onSelectSession={sess => setSelectedSession(sess)}
        />
      </main>

      <Footer />

      <SessionDetailsModal
        isOpen={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
        onBook={sess => handleBook(sess)}
        isBooked={userBookings.some(b => b.session_id === selectedSession?.id && b.status !== 'cancelled')}
      />
    </div>
  );
};
