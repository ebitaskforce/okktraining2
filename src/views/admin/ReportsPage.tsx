import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { TrainingSession, Booking, UserProfile } from '../../types';
import { exportToPDF, exportToExcel, exportToCSV } from '../../utils/exportUtils';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Footer } from '../../components/common/Footer';
import { BarChart3, Download, FileText, Sheet, FileSpreadsheet } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    Promise.all([
      dataService.getSessions(),
      dataService.getBookings(),
      dataService.getUsers()
    ]).then(([s, b, u]) => {
      setSessions(s);
      setBookings(b);
      setUsers(u);
    });
  }, []);

  const totalUsers = users.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysSessions = sessions.filter(s => s.session_date === todayStr);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;
  const rejectedCount = bookings.filter(b => b.status === 'rejected').length;
  const fullCount = sessions.filter(s => s.booked_seats >= s.max_seats || s.status === 'closed').length;
  const availableSeatsCount = sessions.reduce((acc, s) => acc + Math.max(0, s.max_seats - s.booked_seats), 0);

  const getExportData = () => {
    return bookings.map(b => ({
      Booking_ID: b.id,
      Staff_Name: b.user_name || 'N/A',
      Staff_ID: b.staff_id || 'N/A',
      Department: b.department || 'N/A',
      Session_Title: b.session_title || 'N/A',
      Session_Date: b.session_date || 'N/A',
      Slot_Type: b.session_type || 'N/A',
      Venue: b.venue || 'N/A',
      Status: b.status.toUpperCase(),
      Attendance: (b.attendance_status || 'PENDING').toUpperCase(),
      Booking_Date: new Date(b.booking_date).toLocaleDateString()
    }));
  };

  const handleExportCSV = () => {
    exportToCSV('Training_System_Bookings_Report', getExportData());
  };

  const handleExportExcel = () => {
    exportToExcel('Training_System_Bookings_Report', getExportData());
  };

  const handleExportPDF = () => {
    const data = getExportData();
    const headers = ['Staff Name', 'Staff ID', 'Department', 'Training Title', 'Date', 'Status'];
    const rows = data.map(d => [d.Staff_Name, d.Staff_ID, d.Department, d.Session_Title, d.Session_Date, d.Status]);
    exportToPDF('Training Session Booking & Attendance Report 2026', headers, rows, 'Training_System_Report');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white">System Executive Reports</h1>
              <p className="text-xs text-slate-400 mt-1">
                Summary reporting dashboard with instant export capabilities to PDF, Excel, and CSV formats
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <Sheet className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Reporting Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Users</p>
              <p className="text-xl font-extrabold text-white mt-1">{totalUsers}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Today's Sessions</p>
              <p className="text-xl font-extrabold text-blue-400 mt-1">{todaysSessions.length}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Pending</p>
              <p className="text-xl font-extrabold text-amber-400 mt-1">{pendingCount}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Approved</p>
              <p className="text-xl font-extrabold text-emerald-400 mt-1">{approvedCount}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Rejected</p>
              <p className="text-xl font-extrabold text-rose-400 mt-1">{rejectedCount}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Avail Seats</p>
              <p className="text-xl font-extrabold text-purple-400 mt-1">{availableSeatsCount}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Full Sessions</p>
              <p className="text-xl font-extrabold text-rose-500 mt-1">{fullCount}</p>
            </div>
          </div>

          {/* Detailed Summary Table */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Consolidated Booking Audit Record
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Staff Name</th>
                    <th className="p-3">Staff ID</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Course Title</th>
                    <th className="p-3">Session Date</th>
                    <th className="p-3">Approval Status</th>
                    <th className="p-3">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-800/50">
                      <td className="p-3 font-bold text-white">{b.user_name}</td>
                      <td className="p-3 text-slate-300 font-mono">{b.staff_id}</td>
                      <td className="p-3 text-slate-300">{b.department}</td>
                      <td className="p-3 text-white font-semibold">{b.session_title}</td>
                      <td className="p-3 text-slate-300">{b.session_date}</td>
                      <td className="p-3">
                        <span className="uppercase text-[10px] font-extrabold">{b.status}</span>
                      </td>
                      <td className="p-3">
                        <span className="uppercase text-[10px] font-extrabold">{b.attendance_status}</span>
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
    </div>
  );
};
