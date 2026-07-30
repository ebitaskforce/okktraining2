import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { dataService } from '../../services/dataService';
import { TrainingSession, Booking, SessionType } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { SessionCard } from '../../components/sessions/SessionCard';
import { SessionDetailsModal } from '../../components/sessions/SessionDetailsModal';
import { Search, Filter, Calendar as CalendarIcon, Sun, Moon } from 'lucide-react';

export const UserSessionsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [slotFilter, setSlotFilter] = useState<'all' | SessionType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'full'>('all');

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
        showToast(`Added to Waitlist (Position #${res.waitlist.position})!`, 'warning');
      } else {
        showToast('Booking request submitted! Pending approval.', 'success');
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Booking failed', 'error');
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.session_date.includes(searchQuery);

    const matchesSlot = slotFilter === 'all' || s.session_type === slotFilter;
    
    const isFull = s.booked_seats >= s.max_seats || s.status === 'closed';
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'available' && !isFull && s.status !== 'cancelled') ||
      (statusFilter === 'full' && isFull);

    return matchesSearch && matchesSlot && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Training Session Catalogue</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse and reserve your seat for upcoming morning or afternoon professional development slots
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search title, trainer, venue, date..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto text-xs">
            <select
              value={slotFilter}
              onChange={e => setSlotFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
            >
              <option value="all">All Slot Types</option>
              <option value="morning">Morning Sessions</option>
              <option value="afternoon">Afternoon Sessions</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
            >
              <option value="all">All Availability</option>
              <option value="available">Available Seats</option>
              <option value="full">Full / Waitlist Only</option>
            </select>
          </div>
        </div>

        {/* Grid Display */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-slate-400 space-y-2">
            <p className="text-base font-semibold text-slate-600 dark:text-slate-300">No training sessions found</p>
            <p className="text-xs">Try clearing search filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredSessions.map(s => {
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
        )}
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
