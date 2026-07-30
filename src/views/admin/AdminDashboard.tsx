import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { TrainingSession, Booking, UserProfile } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Footer } from '../../components/common/Footer';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PieChart, 
  AlertCircle,
  TrendingUp,
  Move,
  BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart as RePieChart, Pie, Cell } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Widget Order State (Rearrangeable Widgets)
  const [widgetOrder, setWidgetOrder] = useState<string[]>(['metrics', 'charts', 'recent']);

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
  const pendingApprovals = bookings.filter(b => b.status === 'pending');
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const rejectedBookings = bookings.filter(b => b.status === 'rejected');
  const fullSessions = sessions.filter(s => s.booked_seats >= s.max_seats || s.status === 'closed');
  const totalSeatsAvailable = sessions.reduce((acc, s) => acc + Math.max(0, s.max_seats - s.booked_seats), 0);

  // Chart Data Preparation
  const weeklyData = [
    { day: 'Mon', bookings: 12 },
    { day: 'Tue', bookings: 19 },
    { day: 'Wed', bookings: 15 },
    { day: 'Thu', bookings: 22 },
    { day: 'Fri', bookings: 18 },
  ];

  const pieData = [
    { name: 'Approved', value: approvedBookings.length, color: '#10b981' },
    { name: 'Pending', value: pendingApprovals.length, color: '#f59e0b' },
    { name: 'Rejected', value: rejectedBookings.length, color: '#ef4444' },
  ];

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...widgetOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      const temp = newOrder[index];
      newOrder[index] = newOrder[targetIndex];
      newOrder[targetIndex] = temp;
      setWidgetOrder(newOrder);
    }
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
              <h1 className="text-2xl font-extrabold text-white">Administrator Analytics & Control Center</h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time booking metrics, seat occupancy, and systemic approval trends
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-900/50 border border-blue-700 text-blue-300">
              Logged as: {user?.full_name} ({user?.role?.toUpperCase()})
            </span>
          </div>

          {/* Dynamic Rearrangeable Widgets Loop */}
          {widgetOrder.map((widgetId, index) => {
            if (widgetId === 'metrics') {
              return (
                <div key="metrics" className="space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      Key Operational Metrics
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => moveWidget(index, 'up')} disabled={index === 0} className="px-2 py-1 bg-slate-800 rounded disabled:opacity-30 hover:bg-slate-700">↑</button>
                      <button onClick={() => moveWidget(index, 'down')} disabled={index === widgetOrder.length - 1} className="px-2 py-1 bg-slate-800 rounded disabled:opacity-30 hover:bg-slate-700">↓</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Users</span>
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <p className="text-2xl font-extrabold text-white mt-2">{totalUsers}</p>
                    </div>

                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Today's Sessions</span>
                        <Calendar className="w-5 h-5 text-emerald-400" />
                      </div>
                      <p className="text-2xl font-extrabold text-white mt-2">{todaysSessions.length}</p>
                    </div>

                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Pending Approvals</span>
                        <Clock className="w-5 h-5 text-amber-400" />
                      </div>
                      <p className="text-2xl font-extrabold text-amber-400 mt-2">{pendingApprovals.length}</p>
                    </div>

                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Available Seats</span>
                        <CheckCircle2 className="w-5 h-5 text-purple-400" />
                      </div>
                      <p className="text-2xl font-extrabold text-white mt-2">{totalSeatsAvailable}</p>
                    </div>
                  </div>
                </div>
              );
            }

            if (widgetId === 'charts') {
              return (
                <div key="charts" className="space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-purple-400" />
                      Interactive Analytics & Trends
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => moveWidget(index, 'up')} disabled={index === 0} className="px-2 py-1 bg-slate-800 rounded disabled:opacity-30 hover:bg-slate-700">↑</button>
                      <button onClick={() => moveWidget(index, 'down')} disabled={index === widgetOrder.length - 1} className="px-2 py-1 bg-slate-800 rounded disabled:opacity-30 hover:bg-slate-700">↓</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
                      <h3 className="text-sm font-bold text-white mb-4">Weekly Booking Volume</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="day" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                            <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-md">
                      <h3 className="text-sm font-bold text-white mb-4">Approval Status Ratio</h3>
                      <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {pieData.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </main>
      </div>

      <Footer />
    </div>
  );
};
