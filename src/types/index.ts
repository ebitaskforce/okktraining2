export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  staff_id: string;
  department: string;
  phone: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export type SessionType = 'morning' | 'afternoon';
export type SessionStatus = 'available' | 'closed' | 'cancelled';

export interface TrainingSession {
  id: string;
  title: string;
  description: string;
  trainer: string;
  trainer_id?: string;
  venue: string;
  session_date: string; // YYYY-MM-DD
  session_type: SessionType;
  max_seats: number;
  booked_seats: number;
  status: SessionStatus;
  registration_open: string; // YYYY-MM-DD
  registration_close: string; // YYYY-MM-DD
  created_by?: string;
  created_at: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'waitlisted';
export type AttendanceStatus = 'pending' | 'present' | 'late' | 'absent' | 'excused';

export interface Booking {
  id: string;
  user_id: string;
  session_id: string;
  status: BookingStatus;
  approval_notes?: string;
  booking_date: string;
  approved_by?: string;
  approved_date?: string;
  qr_code_token: string;
  attendance_status: AttendanceStatus;
  attendance_marked_at?: string;
  attendance_marked_by?: string;
  // Joined fields for UI convenience
  user_name?: string;
  staff_id?: string;
  department?: string;
  user_email?: string;
  user_phone?: string;
  session_title?: string;
  session_date?: string;
  session_type?: SessionType;
  venue?: string;
  trainer?: string;
}

export interface WaitlistEntry {
  id: string;
  session_id: string;
  user_id: string;
  position: number;
  created_at: string;
  user_name?: string;
  staff_id?: string;
  department?: string;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

export interface OrganizationSettings {
  id: number;
  organization_name: string;
  website_name: string;
  logo_url: string;
  banner_url: string;
  primary_color: string;
  secondary_color: string;
  footer_text: string;
  contact_email: string;
  phone: string;
  address: string;
}

export interface SystemNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export const DEPARTMENTS = [
  'Information Technology & Cyber Security',
  'Human Resource & Administration',
  'Finance & Accounting',
  'Strategic Planning & Operations',
  'Legal & Governance',
  'Public Relations & Communications',
  'Customer Support & Service Excellence',
  'Research & Development'
];
