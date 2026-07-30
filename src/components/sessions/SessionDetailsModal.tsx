import React from 'react';
import { Modal } from '../common/Modal';
import { TrainingSession } from '../../types';
import { Calendar, Clock, MapPin, User, CheckCircle, AlertCircle, Sun, Moon } from 'lucide-react';

interface SessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TrainingSession | null;
  onBook?: (session: TrainingSession) => void;
  isBooked?: boolean;
}

export const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  isOpen,
  onClose,
  session,
  onBook,
  isBooked = false
}) => {
  if (!session) return null;

  const remainingSeats = Math.max(0, session.max_seats - session.booked_seats);
  const isFull = remainingSeats === 0 || session.status === 'closed';
  const isCancelled = session.status === 'cancelled';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Training Session Details" maxWidth="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 ${
              session.session_type === 'morning'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
            }`}>
              {session.session_type === 'morning' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {session.session_type} Session
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {session.title}
            </h2>
          </div>

          <div>
            {isCancelled ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                CANCELLED
              </span>
            ) : isFull ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                FULL
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                AVAILABLE
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800">
          {session.description || 'No detailed description available for this training course.'}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-slate-900/40 rounded-lg border border-blue-100 dark:border-slate-800">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Session Date</p>
              <p className="font-bold text-slate-900 dark:text-white">{session.session_date}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-purple-50/50 dark:bg-slate-900/40 rounded-lg border border-purple-100 dark:border-slate-800">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Slot Timing</p>
              <p className="font-bold text-slate-900 dark:text-white">
                {session.session_type === 'morning' ? '09:00 AM - 12:30 PM' : '02:00 PM - 05:30 PM'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-emerald-50/50 dark:bg-slate-900/40 rounded-lg border border-emerald-100 dark:border-slate-800">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Assigned Trainer</p>
              <p className="font-bold text-slate-900 dark:text-white">{session.trainer}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-rose-50/50 dark:bg-slate-900/40 rounded-lg border border-rose-100 dark:border-slate-800">
            <MapPin className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Venue Location</p>
              <p className="font-bold text-slate-900 dark:text-white truncate">{session.venue}</p>
            </div>
          </div>
        </div>

        {/* Seat Metrics */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Seat Availability Metrics</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-400 font-semibold">Maximum Seats</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">{session.max_seats}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-400 font-semibold">Booked Seats</p>
              <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{session.booked_seats}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-400 font-semibold">Remaining Seats</p>
              <p className={`text-lg font-extrabold ${remainingSeats === 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {remainingSeats}
              </p>
            </div>
          </div>
        </div>

        {/* Registration Window */}
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
          <span>Registration Open: <strong>{session.registration_open}</strong></span>
          <span>Registration Close: <strong>{session.registration_close}</strong></span>
        </div>

        {/* Action Button */}
        {onBook && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                onBook(session);
                onClose();
              }}
              disabled={isCancelled || isBooked}
              className={`w-full py-3 rounded-lg text-sm font-bold text-white shadow-md transition-all ${
                isBooked
                  ? 'bg-slate-400 cursor-not-allowed'
                  : isCancelled
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isFull
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isBooked ? 'Already Booked' : isFull ? 'Join Waitlist Queue' : 'Confirm Session Booking'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
