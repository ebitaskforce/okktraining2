import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { TrainingSession } from '../../types';

interface SessionCalendarProps {
  sessions: TrainingSession[];
  onSelectSession: (session: TrainingSession) => void;
}

export const SessionCalendar: React.FC<SessionCalendarProps> = ({ sessions, onSelectSession }) => {
  const events = sessions.map(s => {
    const isFull = s.booked_seats >= s.max_seats || s.status === 'closed';
    const isCancelled = s.status === 'cancelled';

    let color = '#10b981'; // Green for Available
    let statusText = 'Available';

    if (isCancelled) {
      color = '#6b7280'; // Gray for Cancelled
      statusText = 'Cancelled';
    } else if (isFull) {
      color = '#ef4444'; // Red for Full
      statusText = 'FULL';
    }

    return {
      id: s.id,
      title: `${s.session_type === 'morning' ? '🌅 AM' : '🌆 PM'} - ${s.title} (${statusText})`,
      start: `${s.session_date}T${s.session_type === 'morning' ? '09:00:00' : '14:00:00'}`,
      end: `${s.session_date}T${s.session_type === 'morning' ? '12:30:00' : '17:30:00'}`,
      backgroundColor: color,
      borderColor: color,
      textColor: '#ffffff',
      extendedProps: { session: s }
    };
  });

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
      {/* Calendar Color Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs font-semibold text-slate-600 dark:text-slate-300 pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span>Full / Closed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-500" />
          <span>Cancelled</span>
        </div>
      </div>

      <FullCalendar
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plugins={[dayGridPlugin as any, timeGridPlugin as any, interactionPlugin as any]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        eventClick={(info) => {
          const session = info.event.extendedProps['session'] as TrainingSession;
          if (session) onSelectSession(session);
        }}
        height="auto"
      />
    </div>
  );
};
