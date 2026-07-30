import { supabase, isSupabaseConfigured } from './supabase';
import { mockStorage } from './mockDataService';
import { 
  TrainingSession, 
  Booking, 
  WaitlistEntry, 
  UserProfile, 
  Trainer, 
  OrganizationSettings, 
  SystemNotification, 
  AuditLog,
  BookingStatus,
  AttendanceStatus
} from '../types';

export const dataService = {
  // ==========================================
  // SESSIONS
  // ==========================================
  async getSessions(): Promise<TrainingSession[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('training_sessions').select('*').order('session_date', { ascending: true });
      if (!error && data) return data;
    }
    return mockStorage.getSessions();
  },

  async createSession(sessionData: Omit<TrainingSession, 'id' | 'booked_seats' | 'created_at'>, adminId: string, adminName: string): Promise<TrainingSession> {
    // Check Room & Date Conflict
    const existing = await this.getSessions();
    const conflict = existing.find(s => 
      s.venue.toLowerCase().trim() === sessionData.venue.toLowerCase().trim() &&
      s.session_date === sessionData.session_date &&
      s.session_type === sessionData.session_type &&
      s.status !== 'cancelled'
    );

    if (conflict) {
      throw new Error(`Venue Conflict: "${sessionData.venue}" is already booked for the ${sessionData.session_type.toUpperCase()} session on ${sessionData.session_date} ("${conflict.title}").`);
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('training_sessions').insert([{
        ...sessionData,
        booked_seats: 0,
        created_by: adminId
      }]).select().single();
      if (!error && data) {
        await this.addAuditLog(adminId, adminName, 'CREATE_SESSION', `Session #${data.id}`, `Created "${data.title}"`);
        return data;
      }
    }

    const sessions = mockStorage.getSessions();
    const newSession: TrainingSession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
      booked_seats: 0,
      created_at: new Date().toISOString()
    };
    sessions.unshift(newSession);
    mockStorage.setSessions(sessions);
    mockStorage.addAuditLog(adminId, adminName, 'CREATE_SESSION', `Session #${newSession.id}`, `Created "${newSession.title}"`);
    return newSession;
  },

  async updateSession(id: string, updates: Partial<TrainingSession>, adminId: string, adminName: string): Promise<TrainingSession> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('training_sessions').update(updates).eq('id', id).select().single();
      if (!error && data) {
        await this.addAuditLog(adminId, adminName, 'UPDATE_SESSION', `Session #${id}`, `Updated details for "${data.title}"`);
        return data;
      }
    }

    const sessions = mockStorage.getSessions();
    const index = sessions.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Session not found');

    const updated = { ...sessions[index], ...updates };
    sessions[index] = updated;
    mockStorage.setSessions(sessions);
    mockStorage.addAuditLog(adminId, adminName, 'UPDATE_SESSION', `Session #${id}`, `Updated details for "${updated.title}"`);
    return updated;
  },

  async deleteSession(id: string, adminId: string, adminName: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('training_sessions').delete().eq('id', id);
      await this.addAuditLog(adminId, adminName, 'DELETE_SESSION', `Session #${id}`, `Deleted session ID #${id}`);
      return;
    }

    const sessions = mockStorage.getSessions().filter(s => s.id !== id);
    mockStorage.setSessions(sessions);
    mockStorage.addAuditLog(adminId, adminName, 'DELETE_SESSION', `Session #${id}`, `Deleted session ID #${id}`);
  },

  async duplicateSession(id: string, newDate: string, adminId: string, adminName: string): Promise<TrainingSession> {
    const sessions = await this.getSessions();
    const target = sessions.find(s => s.id === id);
    if (!target) throw new Error('Source session not found');

    const { id: _, booked_seats: __, created_at: ___, ...rest } = target;
    return this.createSession({
      ...rest,
      title: `${rest.title} (Copy)`,
      session_date: newDate,
      registration_open: newDate,
      registration_close: newDate
    }, adminId, adminName);
  },

  // ==========================================
  // BOOKINGS & WAITLIST
  // ==========================================
  async getBookings(): Promise<Booking[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('bookings').select(`
        *,
        profiles:user_id(full_name, staff_id, department, email, phone),
        training_sessions:session_id(title, session_date, session_type, venue, trainer)
      `).order('booking_date', { ascending: false });
      
      if (!error && data) {
        return data.map((b: any) => ({
          ...b,
          user_name: b.profiles?.full_name,
          staff_id: b.profiles?.staff_id,
          department: b.profiles?.department,
          user_email: b.profiles?.email,
          user_phone: b.profiles?.phone,
          session_title: b.training_sessions?.title,
          session_date: b.training_sessions?.session_date,
          session_type: b.training_sessions?.session_type,
          venue: b.training_sessions?.venue,
          trainer: b.training_sessions?.trainer
        }));
      }
    }

    const bookings = mockStorage.getBookings();
    const profiles = mockStorage.getProfiles();
    const sessions = mockStorage.getSessions();

    return bookings.map(b => {
      const u = profiles.find(p => p.id === b.user_id);
      const s = sessions.find(sess => sess.id === b.session_id);
      return {
        ...b,
        user_name: u?.full_name || 'Unknown User',
        staff_id: u?.staff_id || 'N/A',
        department: u?.department || 'N/A',
        user_email: u?.email || 'N/A',
        user_phone: u?.phone || 'N/A',
        session_title: s?.title || 'Unknown Session',
        session_date: s?.session_date || 'N/A',
        session_type: s?.session_type || 'morning',
        venue: s?.venue || 'N/A',
        trainer: s?.trainer || 'N/A'
      };
    });
  },

  async bookSession(userId: string, sessionId: string): Promise<{ booking?: Booking; waitlist?: WaitlistEntry }> {
    const sessions = await this.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found');

    const bookings = await this.getBookings();
    const existing = bookings.find(b => b.user_id === userId && b.session_id === sessionId && b.status !== 'cancelled' && b.status !== 'rejected');
    if (existing) {
      throw new Error(`You already have an active booking (${existing.status.toUpperCase()}) for this session.`);
    }

    const profiles = mockStorage.getProfiles();
    const userProfile = profiles.find(p => p.id === userId);

    // Check if session is full or closed
    if (session.booked_seats >= session.max_seats || session.status === 'closed') {
      // Add to waitlist!
      const waitlist = mockStorage.getWaitlist();
      const existingWait = waitlist.find(w => w.session_id === sessionId && w.user_id === userId);
      if (existingWait) {
        throw new Error(`You are already on the waitlist (Position #${existingWait.position}) for this session.`);
      }

      const position = waitlist.filter(w => w.session_id === sessionId).length + 1;
      const newWaitEntry: WaitlistEntry = {
        id: `wl-${Date.now()}`,
        session_id: sessionId,
        user_id: userId,
        position,
        created_at: new Date().toISOString(),
        user_name: userProfile?.full_name,
        staff_id: userProfile?.staff_id,
        department: userProfile?.department
      };

      waitlist.push(newWaitEntry);
      mockStorage.setWaitlist(waitlist);

      // Create notification
      mockStorage.addNotification({
        user_id: userId,
        title: 'Waitlist Joined',
        message: `Session "${session.title}" is full. You have been added to the waitlist at Position #${position}.`
      });

      return { waitlist: newWaitEntry };
    }

    // Normal Booking
    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      user_id: userId,
      session_id: sessionId,
      status: 'pending',
      booking_date: new Date().toISOString(),
      qr_code_token: `QR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      attendance_status: 'pending'
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('bookings').insert([newBooking]);
    } else {
      const allBookings = mockStorage.getBookings();
      allBookings.unshift(newBooking);
      mockStorage.setBookings(allBookings);
    }

    mockStorage.addNotification({
      user_id: userId,
      title: 'Booking Submitted',
      message: `Your booking for "${session.title}" (${session.session_type.toUpperCase()} session) is submitted and pending approval.`
    });

    const fullBookings = await this.getBookings();
    const inserted = fullBookings.find(b => b.id === newBooking.id) || newBooking;
    return { booking: inserted };
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus, notes: string | undefined, adminId: string, adminName: string): Promise<Booking> {
    const bookings = mockStorage.getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index === -1) throw new Error('Booking not found');

    const targetBooking = bookings[index];
    const sessions = mockStorage.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === targetBooking.session_id);
    const session = sessions[sessionIndex];

    const prevStatus = targetBooking.status;
    targetBooking.status = status;
    if (notes) targetBooking.approval_notes = notes;
    if (status === 'approved') {
      targetBooking.approved_by = adminId;
      targetBooking.approved_date = new Date().toISOString();
    }

    bookings[index] = targetBooking;
    mockStorage.setBookings(bookings);

    // Update session booked seats if approved or cancelled/rejected
    if (session) {
      const approvedCount = bookings.filter(b => b.session_id === session.id && b.status === 'approved').length;
      session.booked_seats = approvedCount;
      if (session.booked_seats >= session.max_seats) {
        session.status = 'closed';
      } else {
        session.status = 'available';
      }
      sessions[sessionIndex] = session;
      mockStorage.setSessions(sessions);
    }

    // Auto-promote from Waitlist if seat opened up from previous approved booking cancel/reject
    if ((prevStatus === 'approved' && (status === 'cancelled' || status === 'rejected')) && session && session.booked_seats < session.max_seats) {
      const waitlist = mockStorage.getWaitlist();
      const sessionWait = waitlist.filter(w => w.session_id === session.id).sort((a, b) => a.position - b.position);
      if (sessionWait.length > 0) {
        const topWait = sessionWait[0];
        // Auto create pending booking for waitlisted user
        const autoBooking: Booking = {
          id: `book-auto-${Date.now()}`,
          user_id: topWait.user_id,
          session_id: session.id,
          status: 'pending',
          booking_date: new Date().toISOString(),
          qr_code_token: `QR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          attendance_status: 'pending'
        };
        bookings.unshift(autoBooking);
        mockStorage.setBookings(bookings);

        // Remove from waitlist
        const newWaitlist = waitlist.filter(w => w.id !== topWait.id);
        mockStorage.setWaitlist(newWaitlist);

        mockStorage.addNotification({
          user_id: topWait.user_id,
          title: 'Promoted from Waitlist!',
          message: `A seat became available for "${session.title}". You have been automatically moved to Pending Approval!`
        });
      }
    }

    // Create Notification & Audit Log
    mockStorage.addNotification({
      user_id: targetBooking.user_id,
      title: `Booking ${status.toUpperCase()}`,
      message: `Your booking for "${session?.title || 'Session'}" has been ${status}. ${notes ? `Note: ${notes}` : ''}`
    });

    mockStorage.addAuditLog(adminId, adminName, `${status.toUpperCase()}_BOOKING`, `Booking #${bookingId}`, `Set status to ${status} for user ID ${targetBooking.user_id}`);

    const allFull = await this.getBookings();
    return allFull.find(b => b.id === bookingId)!;
  },

  async markAttendance(tokenOrId: string, status: AttendanceStatus, adminId: string, adminName: string): Promise<Booking> {
    const bookings = mockStorage.getBookings();
    const target = bookings.find(b => b.qr_code_token === tokenOrId || b.id === tokenOrId);
    if (!target) throw new Error('Invalid QR Code Ticket or Booking ID');
    if (target.status !== 'approved') throw new Error(`Cannot mark attendance: Booking status is ${target.status.toUpperCase()}, not APPROVED.`);

    target.attendance_status = status;
    target.attendance_marked_at = new Date().toISOString();
    target.attendance_marked_by = adminId;

    mockStorage.setBookings(bookings);
    mockStorage.addAuditLog(adminId, adminName, 'MARK_ATTENDANCE', `Booking #${target.id}`, `Marked attendance as ${status.toUpperCase()}`);

    const all = await this.getBookings();
    return all.find(b => b.id === target.id)!;
  },

  // ==========================================
  // USERS & TRAINERS & SETTINGS
  // ==========================================
  async getUsers(): Promise<UserProfile[]> {
    return mockStorage.getProfiles();
  },

  async updateUserRole(userId: string, role: 'user' | 'admin', adminId: string, adminName: string): Promise<UserProfile> {
    const profiles = mockStorage.getProfiles();
    const u = profiles.find(p => p.id === userId);
    if (!u) throw new Error('User not found');
    u.role = role;
    mockStorage.setProfiles(profiles);
    mockStorage.addAuditLog(adminId, adminName, 'UPDATE_USER_ROLE', `User #${userId}`, `Updated role to ${role}`);
    return u;
  },

  async toggleUserActive(userId: string, isActive: boolean, adminId: string, adminName: string): Promise<UserProfile> {
    const profiles = mockStorage.getProfiles();
    const u = profiles.find(p => p.id === userId);
    if (!u) throw new Error('User not found');
    u.is_active = isActive;
    mockStorage.setProfiles(profiles);
    mockStorage.addAuditLog(adminId, adminName, 'TOGGLE_USER_ACTIVE', `User #${userId}`, `Set active state to ${isActive}`);
    return u;
  },

  async getTrainers(): Promise<Trainer[]> {
    return mockStorage.getTrainers();
  },

  async createTrainer(trainer: Omit<Trainer, 'id' | 'created_at'>): Promise<Trainer> {
    const trainers = mockStorage.getTrainers();
    const newTr: Trainer = {
      ...trainer,
      id: `tr-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    trainers.unshift(newTr);
    mockStorage.setTrainers(trainers);
    return newTr;
  },

  async getOrgSettings(): Promise<OrganizationSettings> {
    return mockStorage.getOrgSettings();
  },

  async updateOrgSettings(settings: OrganizationSettings): Promise<OrganizationSettings> {
    mockStorage.setOrgSettings(settings);
    return settings;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return mockStorage.getAuditLogs();
  },

  async addAuditLog(adminId: string, adminName: string, action: string, target: string, details: string) {
    mockStorage.addAuditLog(adminId, adminName, action, target, details);
  }
};
