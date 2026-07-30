import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { dataService } from '../../services/dataService';
import { TrainingSession, SessionType, SessionStatus, Trainer } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Footer } from '../../components/common/Footer';
import { SessionFormModal } from '../../components/sessions/SessionFormModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  Plus, 
  Search, 
  Filter, 
  Copy, 
  Trash2, 
  Edit3, 
  Sun, 
  Moon, 
  Calendar, 
  AlertTriangle,
  Users
} from 'lucide-react';

export const SessionManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | SessionType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SessionStatus>('all');

  const loadData = async () => {
    const [s, t] = await Promise.all([
      dataService.getSessions(),
      dataService.getTrainers()
    ]);
    setSessions(s);
    setTrainers(t);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSession = async (
    sessionData: Omit<TrainingSession, 'id' | 'booked_seats' | 'created_at'>,
    isRecurring?: boolean,
    recurringType?: 'daily' | 'weekly' | 'monthly',
    count?: number
  ) => {
    if (!user) return;

    if (selectedSession) {
      // Edit
      await dataService.updateSession(selectedSession.id, sessionData, user.id, user.full_name);
      showToast('Session updated successfully.', 'success');
    } else if (isRecurring && count && count > 1) {
      // Recurring Generation Loop
      let currentDate = new Date(sessionData.session_date);
      for (let i = 0; i < count; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        try {
          await dataService.createSession({
            ...sessionData,
            title: `${sessionData.title} (Part ${i + 1})`,
            session_date: dateStr,
            registration_open: dateStr,
            registration_close: dateStr
          }, user.id, user.full_name);
        } catch (e: any) {
          console.warn('Skipped conflicting date:', dateStr);
        }

        if (recurringType === 'daily') currentDate.setDate(currentDate.getDate() + 1);
        else if (recurringType === 'weekly') currentDate.setDate(currentDate.getDate() + 7);
        else if (recurringType === 'monthly') currentDate.setMonth(currentDate.getMonth() + 1);
      }
      showToast(`Batch generated ${count} recurring sessions.`, 'success');
    } else {
      // Single Create
      await dataService.createSession(sessionData, user.id, user.full_name);
      showToast('New training session created.', 'success');
    }

    loadData();
  };

  const handleDeleteSession = async () => {
    if (!deleteTargetId || !user) return;
    try {
      await dataService.deleteSession(deleteTargetId, user.id, user.full_name);
      showToast('Session deleted.', 'info');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleDuplicate = async (session: TrainingSession) => {
    if (!user) return;
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    try {
      await dataService.duplicateSession(session.id, tomorrow, user.id, user.full_name);
      showToast(`Duplicated "${session.title}" for ${tomorrow}`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Duplicate failed', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!user || selectedIds.length === 0) return;
    for (const id of selectedIds) {
      await dataService.deleteSession(id, user.id, user.full_name);
    }
    showToast(`Bulk deleted ${selectedIds.length} sessions.`, 'info');
    setSelectedIds([]);
    loadData();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || s.session_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
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
              <h1 className="text-2xl font-extrabold text-white">Training Session Management</h1>
              <p className="text-xs text-slate-400 mt-1">
                Schedule morning/afternoon training slots, set seat limits, and resolve room conflicts
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedSession(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Session
            </button>
          </div>

          {/* Search, Filter, Bulk Actions */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search title, trainer, venue..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none"
              >
                <option value="all">All Slot Types</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete ({selectedIds.length})
                </button>
              )}
            </div>
          </div>

          {/* Sessions Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredSessions.length && filteredSessions.length > 0}
                        onChange={e => {
                          if (e.target.checked) setSelectedIds(filteredSessions.map(s => s.id));
                          else setSelectedIds([]);
                        }}
                      />
                    </th>
                    <th className="p-4">Session Title</th>
                    <th className="p-4">Date & Slot</th>
                    <th className="p-4">Trainer & Venue</th>
                    <th className="p-4">Seats</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {filteredSessions.map(s => {
                    const isSelected = selectedIds.includes(s.id);
                    return (
                      <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(s.id)}
                          />
                        </td>
                        <td className="p-4 font-bold text-white max-w-xs">
                          {s.title}
                          <span className="block text-[10px] text-slate-400 font-normal line-clamp-1">{s.description}</span>
                        </td>
                        <td className="p-4 text-slate-300">
                          {s.session_date}
                          <span className={`block text-[10px] font-bold uppercase ${s.session_type === 'morning' ? 'text-amber-400' : 'text-indigo-400'}`}>
                            {s.session_type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300">
                          <div>{s.trainer}</div>
                          <div className="text-[10px] text-slate-400">{s.venue}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-white">{s.booked_seats}</span> / {s.max_seats}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            s.status === 'available' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            s.status === 'closed' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                            'bg-gray-800 text-gray-400'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button
                            onClick={() => handleDuplicate(s)}
                            title="Duplicate Session"
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSession(s);
                              setIsFormOpen(true);
                            }}
                            title="Edit Session"
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(s.id)}
                            title="Delete Session"
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      <SessionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveSession}
        initialData={selectedSession}
        trainers={trainers}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteSession}
        title="Delete Training Session"
        message="Are you sure you want to permanently delete this training session? Associated bookings will also be affected."
        isDanger={true}
      />
    </div>
  );
};
