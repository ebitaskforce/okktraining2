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

const getRelativeDateTime = (offsetMinutes: number): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + offsetMinutes);
  return d.toISOString();
};

// Initial Seed Profiles
const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-admin-1',
    full_name: 'Dr. Sarah Connor',
    staff_id: 'ADM-9001',
    department: 'Information Technology & Cyber Security',
    phone: '+60 12-345 6789',
    email: 'admin@gov.my',
    role: 'admin',
    is_active: true,
    created_at: getRelativeDate(-60)
  },
  {
    id: 'user-regular-1',
    full_name: 'Ahmad Razak',
    staff_id: 'STF-1002',
    department: 'Human Resource & Administration',
    phone: '+60 13-987 6543',
    email: 'user@gov.my',
    role: 'user',
    is_active: true,
    created_at: getRelativeDate(-45)
  },
  {
    id: 'user-regular-2',
    full_name: 'Emily Tan',
    staff_id: 'STF-1003',
    department: 'Finance & Accounting',
    phone: '+60 17-234 5678',
    email: 'emily.tan@gov.my',
    role: 'user',
    is_active: true,
    created_at: getRelativeDate(-30)
  },
  {
    id: 'user-regular-3',
    full_name: 'Mohd Hafiz',
    staff_id: 'STF-1004',
    department: 'Strategic Planning & Operations',
    phone: '+60 19-876 5432',
    email: 'hafiz@gov.my',
    role: 'user',
    is_active: true,
    created_at: getRelativeDate(-15)
  }
];

// Initial Seed Trainers
const INITIAL_TRAINERS: Trainer[] = [
  {
    id: 'tr-1',
    name: 'Prof. Jason Vance',
    email: 'jason.vance@academy.org',
    phone: '+60 11-1234 5678',
    specialty: 'Cyber Security & AI Policy',
    bio: 'Senior Technical Lead with over 15 years experience in Enterprise Cloud and Government Cybersecurity Compliance.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: getRelativeDate(-90)
  },
  {
    id: 'tr-2',
    name: 'Dr. Maria Santos',
    email: 'maria.santos@academy.org',
    phone: '+60 11-8765 4321',
    specialty: 'Public Leadership & Change Management',
    bio: 'International Speaker and Corporate Consultant specializing in agile government transformations.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    created_at: getRelativeDate(-90)
  },
  {
    id: 'tr-3',
    name: 'Eng. Kevin Lim',
    email: 'kevin.lim@academy.org',
    phone: '+60 12-555 8899',
    specialty: 'Data Analytics & Power BI Masterclass',
    bio: 'Certified Microsoft Most Valuable Professional (MVP) in Data Analytics.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: getRelativeDate(-90)
  }
];

// Initial Seed Sessions (Morning & Afternoon slots)
const INITIAL_SESSIONS: TrainingSession[] = [
  {
    id: 'sess-1',
    title: 'Cybersecurity Awareness & Threat Intelligence 2026',
    description: 'Comprehensive workshop on protecting organizational infrastructure from phishing, ransomware, and zero-day vulnerabilities.',
    trainer: 'Prof. Jason Vance',
    trainer_id: 'tr-1',
    venue: 'Auditorium Level 3, Main Building',
    session_date: getRelativeDate(1),
    session_type: 'morning',
    max_seats: 25,
    booked_seats: 18,
    status: 'available',
    registration_open: getRelativeDate(-10),
    registration_close: getRelativeDate(0),
    created_at: getRelativeDate(-12)
  },
  {
    id: 'sess-2',
    title: 'Advanced Executive Data Analytics with Power BI',
    description: 'Learn to build real-time interactive reporting dashboards and automated data pipelines.',
    trainer: 'Eng. Kevin Lim',
    trainer_id: 'tr-3',
    venue: 'Computer Lab B, Block 2',
    session_date: getRelativeDate(1),
    session_type: 'afternoon',
    max_seats: 15,
    booked_seats: 15,
    status: 'closed', // FULL session for demo testing waitlist
    registration_open: getRelativeDate(-14),
    registration_close: getRelativeDate(0),
    created_at: getRelativeDate(-14)
  },
  {
    id: 'sess-3',
    title: 'Agile Leadership & Digital Transformation in Public Sector',
    description: 'Master framework techniques for agile sprint planning, stakeholder alignment, and government digital service delivery.',
    trainer: 'Dr. Maria Santos',
    trainer_id: 'tr-2',
    venue: 'Conference Room 1',
    session_date: getRelativeDate(3),
    session_type: 'morning',
    max_seats: 30,
    booked_seats: 8,
    status: 'available',
    registration_open: getRelativeDate(-7),
    registration_close: getRelativeDate(2),
    created_at: getRelativeDate(-7)
  },
  {
    id: 'sess-4',
    title: 'AI Prompt Engineering & Automation Workflow Workshop',
    description: 'Practical hands-on training for leveraging AI tools in everyday administrative and document workflows.',
    trainer: 'Prof. Jason Vance',
    trainer_id: 'tr-1',
    venue: 'Auditorium Level 3, Main Building',
    session_date: getRelativeDate(3),
    session_type: 'afternoon',
    max_seats: 20,
    booked_seats: 4,
    status: 'available',
    registration_open: getRelativeDate(-5),
    registration_close: getRelativeDate(2),
    created_at: getRelativeDate(-5)
  },
  {
    id: 'sess-5',
    title: 'Government Financial Management & Budget Planning',
    description: 'Detailed analysis of public procurement procedures, budget allocation, and audit compliance.',
    trainer: 'Dr. Maria Santos',
    trainer_id: 'tr-2',
    venue: 'Seminar Room A',
    session_date: getRelativeDate(7),
    session_type: 'morning',
    max_seats: 40,
    booked_seats: 12,
    status: 'available',
    registration_open: getRelativeDate(-3),
    registration_close: getRelativeDate(6),
    created_at: getRelativeDate(-3)
  }
];

// Initial Seed Bookings
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book-1',
    user_id: 'user-regular-1',
    session_id: 'sess-1',
    status: 'approved',
    approval_notes: 'Approved by HR Director.',
    booking_date: getRelativeDateTime(-1440),
    approved_by: 'user-admin-1',
    approved_date: getRelativeDateTime(-720),
    qr_code_token: 'QR-TOKEN-SESS1-USER1-9876',
    attendance_status: 'present',
    attendance_marked_at: getRelativeDateTime(-300),
    attendance_marked_by: 'user-admin-1'
  },
  {
    id: 'book-2',
    user_id: 'user-regular-1',
    session_id: 'sess-3',
    status: 'pending',
    booking_date: getRelativeDateTime(-300),
    qr_code_token: 'QR-TOKEN-SESS3-USER1-5432',
    attendance_status: 'pending'
  },
  {
    id: 'book-3',
    user_id: 'user-regular-2',
    session_id: 'sess-1',
    status: 'pending',
    booking_date: getRelativeDateTime(-180),
    qr_code_token: 'QR-TOKEN-SESS1-USER2-1122',
    attendance_status: 'pending'
  },
  {
    id: 'book-4',
    user_id: 'user-regular-3',
    session_id: 'sess-2',
    status: 'approved',
    approval_notes: 'Department quota approved.',
    booking_date: getRelativeDateTime(-2880),
    approved_by: 'user-admin-1',
    approved_date: getRelativeDateTime(-1440),
    qr_code_token: 'QR-TOKEN-SESS2-USER3-3344',
    attendance_status: 'pending'
  }
];

// Initial Waitlist
const INITIAL_WAITLIST: WaitlistEntry[] = [
  {
    id: 'wl-1',
    session_id: 'sess-2',
    user_id: 'user-regular-2',
    position: 1,
    created_at: getRelativeDateTime(-120)
  }
];

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

// Initial Notifications
const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    user_id: 'user-regular-1',
    title: 'Booking Approved!',
    message: 'Your booking for Cybersecurity Awareness & Threat Intelligence 2026 (Morning Session) has been approved.',
    is_read: false,
    created_at: getRelativeDateTime(-720)
  },
  {
    id: 'notif-2',
    user_id: 'user-regular-1',
    title: 'Booking Request Submitted',
    message: 'Your booking for Agile Leadership (Morning Session) is currently pending admin approval.',
    is_read: true,
    created_at: getRelativeDateTime(-300)
  }
];

// Initial Audit Logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    admin_id: 'user-admin-1',
    admin_name: 'Dr. Sarah Connor',
    action: 'APPROVED_BOOKING',
    target: 'Booking #book-1 (Ahmad Razak)',
    details: 'Approved morning session booking for Cybersecurity Awareness.',
    timestamp: getRelativeDateTime(-720)
  },
  {
    id: 'log-2',
    admin_id: 'user-admin-1',
    admin_name: 'Dr. Sarah Connor',
    action: 'CREATE_SESSION',
    target: 'Session #sess-4 (AI Prompt Engineering)',
    details: 'Created afternoon session slot for 20 seats.',
    timestamp: getRelativeDateTime(-500)
  }
];

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
