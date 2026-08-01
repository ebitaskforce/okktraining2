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
          user_name: b.profiles?.full_name || 'Registered User',
          staff_id: b.profiles?.staff_id || 'N/A',
          department: b.profiles?.department || 'N/A',
          user_email: b.profiles?.email || 'N/A',
          user_phone: b.profiles?.phone || 'N/A',
          session_title: b.training_sessions?.title || 'Training Session',
          session_date: b.training_sessions?.session_date || 'N/A',
          session_type: b.training_sessions?.session_type || 'morning',
          venue: b.training_sessions?.venue || 'N/A',
          trainer: b.training_sessions?.trainer || 'N/A'
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

    // Check if session is full or closed
    if (session.booked_seats >= session.max_seats || session.status === 'closed') {
      if (isSupabaseConfigured && supabase) {
        const { data: waitCount } = await supabase.from('waitlist').select('id').eq('session_id', sessionId);
        const pos = (waitCount?.length || 0) + 1;
        const { data: newWait } = await supabase.from('waitlist').insert([{
          session_id: sessionId,
          user_id: userId,
          position: pos
        }]).select().single();

        return { waitlist: newWait };
      }

      const waitlist = mockStorage.getWaitlist();
      const position = waitlist.filter(w => w.session_id === sessionId).length + 1;
      const newWaitEntry: WaitlistEntry = {
        id: `wl-${Date.now()}`,
        session_id: sessionId,
        user_id: userId,
        position,
        created_at: new Date().toISOString()
      };

      waitlist.push(newWaitEntry);
      mockStorage.setWaitlist(waitlist);
      return { waitlist: newWaitEntry };
    }

    // Normal Booking
    const newBooking = {
      user_id: userId,
      session_id: sessionId,
      status: 'pending' as BookingStatus,
      booking_date: new Date().toISOString(),
      qr_code_token: `QR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      attendance_status: 'pending' as AttendanceStatus
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('bookings').insert([newBooking]).select().single();
      if (!error && data) {
        return { booking: data };
      }
    }

    const localBooking: Booking = {
      ...newBooking,
      id: `book-${Date.now()}`
    };
    const allBookings = mockStorage.getBookings();
    allBookings.unshift(localBooking);
    mockStorage.setBookings(allBookings);
    return { booking: localBooking };
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus, notes: string | undefined, adminId: string, adminName: string): Promise<Booking> {
    if (isSupabaseConfigured && supabase) {
      const updates: any = { 
        status, 
        approval_notes: notes 
      };
      if (status === 'approved') {
        updates.approved_by = adminId;
        updates.approved_date = new Date().toISOString();
      }

      await supabase.from('bookings').update(updates).eq('id', bookingId);
      await this.addAuditLog(adminId, adminName, `${status.toUpperCase()}_BOOKING`, `Booking #${bookingId}`, `Set status to ${status}`);
      
      const all = await this.getBookings();
      return all.find(b => b.id === bookingId)!;
    }

    const bookings = mockStorage.getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index === -1) throw new Error('Booking not found');

    const targetBooking = bookings[index];
    targetBooking.status = status;
    if (notes) targetBooking.approval_notes = notes;
    if (status === 'approved') {
      targetBooking.approved_by = adminId;
      targetBooking.approved_date = new Date().toISOString();
    }

    bookings[index] = targetBooking;
    mockStorage.setBookings(bookings);
    mockStorage.addAuditLog(adminId, adminName, `${status.toUpperCase()}_BOOKING`, `Booking #${bookingId}`, `Set status to ${status}`);

    const allFull = await this.getBookings();
    return allFull.find(b => b.id === bookingId)!;
  },

  async markAttendance(tokenOrId: string, status: AttendanceStatus, adminId: string, adminName: string): Promise<Booking> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('bookings').update({
        attendance_status: status,
        attendance_marked_at: new Date().toISOString(),
        attendance_marked_by: adminId
      }).or(`qr_code_token.eq.${tokenOrId},id.eq.${tokenOrId}`);

      await this.addAuditLog(adminId, adminName, 'MARK_ATTENDANCE', `Booking #${tokenOrId}`, `Marked attendance as ${status.toUpperCase()}`);
      const all = await this.getBookings();
      return all.find(b => b.id === tokenOrId || b.qr_code_token === tokenOrId)!;
    }

    const bookings = mockStorage.getBookings();
    const target = bookings.find(b => b.qr_code_token === tokenOrId || b.id === tokenOrId);
    if (!target) throw new Error('Invalid QR Code Ticket or Booking ID');

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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return mockStorage.getProfiles();
  },

  async updateUserDetail(userId: string, updates: Partial<UserProfile>, adminId: string, adminName: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
      if (!error && data) {
        await this.addAuditLog(adminId, adminName, 'UPDATE_USER_DETAIL', `User #${userId}`, `Updated profile details for "${data.full_name}" (${data.email})`);
        return data;
      }
    }

    const profiles = mockStorage.getProfiles();
    const index = profiles.findIndex(p => p.id === userId);
    if (index === -1) throw new Error('User profile not found');
    const updated = { ...profiles[index], ...updates };
    profiles[index] = updated;
    mockStorage.setProfiles(profiles);
    mockStorage.addAuditLog(adminId, adminName, 'UPDATE_USER_DETAIL', `User #${userId}`, `Updated profile details for "${updated.full_name}" (${updated.email})`);
    return updated;
  },

  async updateUserRole(userId: string, role: 'user' | 'admin', adminId: string, adminName: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').update({ role }).eq('id', userId).select().single();
      if (!error && data) {
        await this.addAuditLog(adminId, adminName, 'UPDATE_USER_ROLE', `User #${userId}`, `Updated role to ${role}`);
        return data;
      }
    }

    const profiles = mockStorage.getProfiles();
    const u = profiles.find(p => p.id === userId);
    if (!u) throw new Error('User not found');
    u.role = role;
    mockStorage.setProfiles(profiles);
    mockStorage.addAuditLog(adminId, adminName, 'UPDATE_USER_ROLE', `User #${userId}`, `Updated role to ${role}`);
    return u;
  },

  async toggleUserActive(userId: string, isActive: boolean, adminId: string, adminName: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', userId).select().single();
      if (!error && data) {
        await this.addAuditLog(adminId, adminName, 'TOGGLE_USER_ACTIVE', `User #${userId}`, `Set active state to ${isActive}`);
        return data;
      }
    }

    const profiles = mockStorage.getProfiles();
    const u = profiles.find(p => p.id === userId);
    if (!u) throw new Error('User not found');
    u.is_active = isActive;
    mockStorage.setProfiles(profiles);
    mockStorage.addAuditLog(adminId, adminName, 'TOGGLE_USER_ACTIVE', `User #${userId}`, `Set active state to ${isActive}`);
    return u;
  },

  async getTrainers(): Promise<Trainer[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('trainers').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return mockStorage.getTrainers();
  },

  async createTrainer(trainer: Omit<Trainer, 'id' | 'created_at'>): Promise<Trainer> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('trainers').insert([trainer]).select().single();
      if (!error && data) return data;
    }

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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('organization_settings').select('*').single();
      if (!error && data) return data;
    }
    return mockStorage.getOrgSettings();
  },

  async updateOrgSettings(settings: OrganizationSettings): Promise<OrganizationSettings> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('organization_settings').upsert({ id: 1, ...settings }).select().single();
      if (!error && data) return data;
    }

    mockStorage.setOrgSettings(settings);
    return settings;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
      if (!error && data) return data;
    }
    return mockStorage.getAuditLogs();
  },

  async addAuditLog(adminId: string, adminName: string, action: string, target: string, details: string) {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('audit_logs').insert([{
        admin_id: adminId,
        admin_name: adminName,
        action,
        target,
        details
      }]);
      return;
    }
    mockStorage.addAuditLog(adminId, adminName, action, target, details);
  }
};
