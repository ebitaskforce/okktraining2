import React from 'react';
import { Modal } from '../common/Modal';
import { Booking } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Download, Printer, MapPin, Calendar, Clock, User } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TicketQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const TicketQRModal: React.FC<TicketQRModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  if (!booking) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  React.useEffect(() => {
    if (isOpen && booking.status === 'approved') {
      triggerConfetti();
    }
  }, [isOpen, booking]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Attendance Ticket Pass" maxWidth="md">
      <div className="flex flex-col items-center text-center space-y-5">
        {/* Ticket Header Badge */}
        <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">GovTech Official Pass</span>
            <h3 className="text-base font-extrabold truncate">{booking.session_title}</h3>
            <p className="text-xs opacity-90">{booking.session_date} • {booking.session_type?.toUpperCase()} SLOT</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-300 shrink-0" />
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-inner flex flex-col items-center">
          <QRCodeSVG 
            value={booking.qr_code_token} 
            size={180} 
            level="H" 
            includeMargin={true}
          />
          <span className="mt-2 text-[11px] font-mono tracking-wider font-bold text-slate-500">
            {booking.qr_code_token}
          </span>
        </div>

        {/* Participant & Venue Details */}
        <div className="w-full bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl text-xs space-y-2 text-left border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-400">Attendee Name:</span>
            <span className="font-bold text-slate-900 dark:text-white">{booking.user_name}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-400">Staff ID & Dept:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.staff_id} ({booking.department})</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-400">Venue Location:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.venue}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Attendance Status:</span>
            <span className={`font-extrabold uppercase ${
              booking.attendance_status === 'present' ? 'text-emerald-500' :
              booking.attendance_status === 'late' ? 'text-amber-500' : 'text-slate-500'
            }`}>
              {booking.attendance_status}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs"
          >
            <Printer className="w-4 h-4" />
            Print Pass
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
          >
            Close Ticket
          </button>
        </div>
      </div>
    </Modal>
  );
};
