import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Booking } from '../../types';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onApprove: (bookingId: string, notes: string) => Promise<void>;
  onReject: (bookingId: string, notes: string) => Promise<void>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  booking,
  onApprove,
  onReject
}) => {
  if (!booking) return null;

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(booking.id, notes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject(booking.id, notes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Booking Request" maxWidth="md">
      <div className="space-y-4 text-xs">
        {/* Booking Card summary */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">{booking.user_name}</span>
              <span className="text-slate-500 dark:text-slate-400">{booking.staff_id} • {booking.department}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              PENDING
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1 text-slate-600 dark:text-slate-300">
            <p><strong>Training:</strong> {booking.session_title}</p>
            <p><strong>Date & Slot:</strong> {booking.session_date} ({booking.session_type?.toUpperCase()})</p>
            <p><strong>Venue:</strong> {booking.venue}</p>
            <p><strong>Booking Requested:</strong> {new Date(booking.booking_date).toLocaleString()}</p>
          </div>
        </div>

        {/* Approval Notes Input */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Approval / Rejection Remarks (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add comments or instructions for the applicant..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

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
            type="button"
            onClick={handleReject}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Reject Request
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-md disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Approve Request
          </button>
        </div>
      </div>
    </Modal>
  );
};
