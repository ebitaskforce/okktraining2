import React from 'react';
import { TrainingSession } from '../../types';
import { Calendar, MapPin, User, Users, Sun, Moon } from 'lucide-react';

interface SessionCardProps {
  session: TrainingSession;
  onBook?: (session: TrainingSession) => void;
  onSelect?: (session: TrainingSession) => void;
  isBooked?: boolean;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onBook,
  onSelect,
  isBooked = false
}) => {
  const remainingSeats = Math.max(0, session.max_seats - session.booked_seats);
  const isFull = remainingSeats === 0 || session.status === 'closed';
  const isCancelled = session.status === 'cancelled';
  const fillPercentage = Math.min(100, Math.round((session.booked_seats / session.max_seats) * 100));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
            session.session_type === 'morning'
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
          }`}>
            {session.session_type === 'morning' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            {session.session_type} Session
          </span>

          {isCancelled ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              CANCELLED
            </span>
          ) : isFull ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              FULL
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {remainingSeats} SEATS LEFT
            </span>
          )}
        </div>

        {/* Title */}
        <h3 
          onClick={() => onSelect && onSelect(session)}
          className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 cursor-pointer group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
        >
          {session.title}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
          {session.description}
        </p>

        {/* Info Rows */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="font-semibold">{session.session_date}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Trainer: <strong>{session.trainer}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">{session.venue}</span>
          </div>
        </div>

        {/* Seat Availability Bar */}
        <div className="bg-slate-100 dark:bg-slate-700/60 p-3 rounded-lg mb-4 text-xs space-y-1.5">
          <div className="flex justify-between font-medium">
            <span className="text-slate-600 dark:text-slate-400">Seat Occupancy</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {session.booked_seats} / {session.max_seats} Booked
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                fillPercentage >= 100 ? 'bg-rose-500' : fillPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
        <button
          onClick={() => onSelect && onSelect(session)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Details
        </button>

        {onBook && (
          <button
            onClick={() => onBook(session)}
            disabled={isCancelled || isBooked}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
              isBooked
                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                : isCancelled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isFull
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isBooked ? 'Booked' : isFull ? 'Join Waitlist' : 'Book Session'}
          </button>
        )}
      </div>
    </div>
  );
};
