import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { AttendanceStatus, Booking } from '../../types';
import { QrCode, Search, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (tokenOrId: string, status: AttendanceStatus) => Promise<Booking>;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onCheckIn
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('present');
  const [result, setResult] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScanOrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const updatedBooking = await onCheckIn(tokenInput.trim(), selectedStatus);
      setResult(updatedBooking);
      setTokenInput('');
    } catch (err: any) {
      setError(err.message || 'Verification failed. QR Token invalid or booking not approved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Attendance & QR Check-in Terminal" maxWidth="md">
      <div className="space-y-5 text-xs">
        {/* Visual Scanner Simulation Box */}
        <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
          <div className="w-32 h-32 border-2 border-dashed border-emerald-400 rounded-lg flex items-center justify-center animate-pulse">
            <QrCode className="w-16 h-16 text-emerald-400 opacity-80" />
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Camera Scanner Active • Align QR Ticket</p>
        </div>

        {/* Manual Token Form */}
        <form onSubmit={handleScanOrSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Enter QR Code Token or Booking ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="e.g. QR-TOKEN-SESS1-USER1-9876"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Mark Attendance Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['present', 'late', 'absent', 'excused'] as AttendanceStatus[]).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    selectedStatus === st
                      ? st === 'present' ? 'bg-emerald-600 text-white' :
                        st === 'late' ? 'bg-amber-600 text-white' :
                        st === 'absent' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {isSubmitting ? 'Verifying...' : 'Verify & Check-In Attendee'}
          </button>
        </form>

        {/* Error Feedback */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Result Box */}
        {result && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>Check-in Verified Successfully!</span>
            </div>
            <p><strong>Attendee:</strong> {result.user_name} ({result.staff_id})</p>
            <p><strong>Training:</strong> {result.session_title}</p>
            <p><strong>Marked Status:</strong> <span className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">{result.attendance_status}</span></p>
          </div>
        )}
      </div>
    </Modal>
  );
};
