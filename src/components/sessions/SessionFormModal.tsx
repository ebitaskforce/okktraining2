import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { TrainingSession, SessionType, SessionStatus, Trainer } from '../../types';
import { Calendar, MapPin, User, AlertCircle, RefreshCw } from 'lucide-react';

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionData: Omit<TrainingSession, 'id' | 'booked_seats' | 'created_at'>, isRecurring?: boolean, recurringType?: 'daily' | 'weekly' | 'monthly', count?: number) => Promise<void>;
  initialData?: TrainingSession | null;
  trainers: Trainer[];
}

export const SessionFormModal: React.FC<SessionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  trainers
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trainer, setTrainer] = useState('');
  const [venue, setVenue] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('morning');
  const [maxSeats, setMaxSeats] = useState<number>(20);
  const [status, setStatus] = useState<SessionStatus>('available');
  const [registrationOpen, setRegistrationOpen] = useState('');
  const [registrationClose, setRegistrationClose] = useState('');

  // Recurring options
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurringCount, setRecurringCount] = useState<number>(4);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setTrainer(initialData.trainer);
      setVenue(initialData.venue);
      setSessionDate(initialData.session_date);
      setSessionType(initialData.session_type);
      setMaxSeats(initialData.max_seats);
      setStatus(initialData.status);
      setRegistrationOpen(initialData.registration_open);
      setRegistrationClose(initialData.registration_close);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setTrainer(trainers.length > 0 ? trainers[0].name : 'Prof. Jason Vance');
      setVenue('Auditorium Level 3, Main Building');
      setSessionDate(nextWeek);
      setSessionType('morning');
      setMaxSeats(20);
      setStatus('available');
      setRegistrationOpen(today);
      setRegistrationClose(nextWeek);
      setIsRecurring(false);
    }
    setError(null);
  }, [initialData, isOpen, trainers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !trainer || !venue || !sessionDate || !registrationOpen || !registrationClose) {
      setError('Please fill in all required fields.');
      return;
    }

    if (maxSeats <= 0) {
      setError('Maximum seats must be greater than 0.');
      return;
    }

    if (new Date(registrationClose) < new Date(registrationOpen)) {
      setError('Registration close date cannot be before open date.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title,
        description,
        trainer,
        venue,
        session_date: sessionDate,
        session_type: sessionType,
        max_seats: Number(maxSeats),
        status,
        registration_open: registrationOpen,
        registration_close: registrationClose
      }, isRecurring, recurringType, recurringCount);

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? 'Edit Training Session' : 'Create Training Session'} 
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Training Course Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Cybersecurity Awareness 2026"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief overview of course curriculum and requirements..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Trainer & Venue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Trainer *
            </label>
            <input
              type="text"
              required
              value={trainer}
              onChange={e => setTrainer(e.target.value)}
              placeholder="e.g. Prof. Jason Vance"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Venue Location *
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={e => setVenue(e.target.value)}
              placeholder="e.g. Auditorium Level 3"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Session Date & Slot Rule (Morning vs Afternoon) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Session Date *
            </label>
            <input
              type="date"
              required
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Slot Time *
            </label>
            <select
              value={sessionType}
              onChange={e => setSessionType(e.target.value as SessionType)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="morning">Morning (09:00 AM - 12:30 PM)</option>
              <option value="afternoon">Afternoon (02:00 PM - 05:30 PM)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Max Seat Limit *
            </label>
            <input
              type="number"
              min={1}
              required
              value={maxSeats}
              onChange={e => setMaxSeats(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Registration Dates & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Reg. Open Date *
            </label>
            <input
              type="date"
              required
              value={registrationOpen}
              onChange={e => setRegistrationOpen(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Reg. Close Date *
            </label>
            <input
              type="date"
              required
              value={registrationClose}
              onChange={e => setRegistrationClose(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Status *
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as SessionStatus)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="available">Available</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Recurring Generator Toggle (Only when creating new session) */}
        {!initialData && (
          <div className="p-3 bg-blue-50/60 dark:bg-slate-900/60 rounded-lg border border-blue-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="isRecurring" className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                Enable Recurring Batch Generator
              </label>
            </div>

            {isRecurring && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Frequency</label>
                  <select
                    value={recurringType}
                    onChange={e => setRecurringType(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Number of Sessions</label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={recurringCount}
                    onChange={e => setRecurringCount(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Session' : isRecurring ? `Generate ${recurringCount} Sessions` : 'Create Session'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
