import { 
  UserProfile, 
  TrainingSession, 
  Booking, 
  WaitlistEntry, 
  Trainer, 
  OrganizationSettings, 
  SystemNotification, 
  AuditLog 
} from '../types';

// Helper to format date relative to today
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// Initial Seed Profiles (Only Admin)
const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-admin-1',
    full_name: 'System Administrator',
    staff_id: 'ADM-9001',
    department: 'Information Technology & Cyber Security',
    phone: '+60 12-345 6789',
    email: 'admin@gov.my',
    role: 'admin',
    is_active: true,
    created_at: getRelativeDate(-60)
  }
];

// Initial Seed Trainers (Clean state)
const INITIAL_TRAINERS: Trainer[] = [];

// Initial Seed Sessions (Clean state)
const INITIAL_SESSIONS: TrainingSession[] = [];

// Initial Seed Bookings (Clean state)
const INITIAL_BOOKINGS: Booking[] = [];

// Initial Waitlist (Clean state)
const INITIAL_WAITLIST: WaitlistEntry[] = [];

// Initial Org Settings
const INITIAL_ORG_SETTINGS: OrganizationSettings = {
  id: 1,
  organization_name: 'GovTech Training Academy',
  website_name: 'Training Session Portal',
  logo_url: 'https://images.unsplash.com/photo-1542744094-3a317272018a?w=150&auto=format&fit=crop&q=80',
  banner_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
  hero_title: 'Empowering Excellence Through Specialized Training',
  hero_subtitle: 'Welcome to GovTech Training Academy. Browse upcoming professional development courses, register for morning or afternoon slots, and track your booking approvals seamlessly.',
  hero_badge_text: 'Official Government Training & Capacity Building Platform',
  primary_color: '#2563eb',
  secondary_color: '#4f46e5',
  footer_text: '© 2026 GovTech Training Academy. All Rights Reserved.',
  contact_email: 'training.academy@gov.my',
  phone: '+60 3-8000 8000',
  address: 'Level 5, Block B, Federal Government Administrative Centre, Putrajaya, Malaysia'
};

// Initial Notifications (Clean state)
const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

// Initial Audit Logs (Clean state)
const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// LocalStorage Persistence Wrapper
class StorageManager {
  private get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(`okk_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`okk_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage Save Error:', e);
    }
  }

  getProfiles(): UserProfile[] {
    return this.get('profiles', INITIAL_PROFILES);
  }

  setProfiles(data: UserProfile[]) {
    this.set('profiles', data);
  }

  getSessions(): TrainingSession[] {
    return this.get('sessions', INITIAL_SESSIONS);
  }

  setSessions(data: TrainingSession[]) {
    this.set('sessions', data);
  }

  getBookings(): Booking[] {
    return this.get('bookings', INITIAL_BOOKINGS);
  }

  setBookings(data: Booking[]) {
    this.set('bookings', data);
  }

  getWaitlist(): WaitlistEntry[] {
    return this.get('waitlist', INITIAL_WAITLIST);
  }

  setWaitlist(data: WaitlistEntry[]) {
    this.set('waitlist', data);
  }

  getTrainers(): Trainer[] {
    return this.get('trainers', INITIAL_TRAINERS);
  }

  setTrainers(data: Trainer[]) {
    this.set('trainers', data);
  }

  getOrgSettings(): OrganizationSettings {
    return this.get('org_settings', INITIAL_ORG_SETTINGS);
  }

  setOrgSettings(data: OrganizationSettings) {
    this.set('org_settings', data);
  }

  getNotifications(userId: string): SystemNotification[] {
    const all = this.get<SystemNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    return all.filter(n => n.user_id === userId);
  }

  addNotification(notif: Omit<SystemNotification, 'id' | 'created_at' | 'is_read'>) {
    const all = this.get<SystemNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    this.set('notifications', [newNotif, ...all]);
    return newNotif;
  }

  markNotificationRead(notifId: string) {
    const all = this.get<SystemNotification[]>('notifications', INITIAL_NOTIFICATIONS);
    const updated = all.map(n => n.id === notifId ? { ...n, is_read: true } : n);
    this.set('notifications', updated);
  }

  getAuditLogs(): AuditLog[] {
    return this.get('audit_logs', INITIAL_AUDIT_LOGS);
  }

  addAuditLog(adminId: string, adminName: string, action: string, target: string, details: string) {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      admin_id: adminId,
      admin_name: adminName,
      action,
      target,
      details,
      timestamp: new Date().toISOString()
    };
    this.set('audit_logs', [newLog, ...logs]);
  }
}

export const mockStorage = new StorageManager();
