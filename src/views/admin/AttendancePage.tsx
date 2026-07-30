import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { dataService } from '../../services/dataService';
import { Booking, AttendanceStatus } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Footer } from '../../components/common/Footer';
import { QRScannerModal } from '../../components/attendance/QRScannerModal';
import { QrCode, Search, CheckCircle, Clock, XCircle, UserCheck } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    const all = await dataService.getBookings();
    setBookings(all.filter(b => b.status === 'approved'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async (tokenOrId: string, status: AttendanceStatus) => {
    if (!user) throw new Error('Unauthenticated admin session.');
    const updated = await dataService.markAttendance(tokenOrId, status, user.id, user.full_name);
    showToast(`Marked ${updated.user_name} as ${status.toUpperCase()}!`, 'success');
    loadData();
    return updated;
  };

  const filtered = bookings.filter(b => {
    return (
      (b.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.staff_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.session_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.qr_code_token || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Attendance & QR Code Terminal</h1>
              <p className="text-xs text-slate-400 mt-1">
                Scan attendee QR ticket passes or manually register Present, Late, Absent, or Excused status
              </p>
            </div>

            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Open QR Scanner Terminal
            </button>
          </div>

          {/* Search */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search staff name, ID, session, token..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Attendance Roster Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Attendee Name</th>
                    <th className="p-4">Staff ID & Dept</th>
                    <th className="p-4">Session Title</th>
                    <th className="p-4">QR Token</th>
                    <th className="p-4">Attendance Status</th>
                    <th className="p-4 text-right">Quick Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-white">{b.user_name}</td>
                      <td className="p-4 text-slate-300">{b.staff_id} ({b.department})</td>
                      <td className="p-4 text-slate-300 font-semibold">{b.session_title}</td>
                      <td className="p-4 font-mono text-[11px] text-blue-400">{b.qr_code_token}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                          b.attendance_status === 'present' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          b.attendance_status === 'late' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          b.attendance_status === 'absent' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {b.attendance_status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        {(['present', 'late', 'absent', 'excused'] as AttendanceStatus[]).map(st => (
                          <button
                            key={st}
                            onClick={() => handleCheckIn(b.id, st)}
                            className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          >
                            {st}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCheckIn={handleCheckIn}
      />
    </div>
  );
};
