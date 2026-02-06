export enum Role {
  Admin = "admin",
  Member = "member",
  Viewer = "viewer",
}

export type UserRole = Role;

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  committee?: number | null;
  created_at: string;
  img?: string | null;
  [property: string]: unknown;
}

/**
 * Committee
 */
export interface Committee {
  description?: string;
  id?: number;
  name: string;
  reference_id?: string | null;
  [property: string]: unknown;
}

/**
 * CommitteeInput
 */
export interface CommitteeCreatePayload {
  description?: string;
  name: string;
  [property: string]: unknown;
}

export interface MemberWithProgress {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  committee?: number | null;
  created_at?: string;
  session_attendance?: number;
  week_progress?: number;
  [property: string]: unknown;
}

export interface PaginatedResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
}

export interface ResetPasswordPayload {
  email: string;
  [property: string]: unknown;
}

export interface ResetPasswordConfirmPayload {
  uid: string;
  token: string;
  new_password: string;
  [property: string]: unknown;
}

export interface SetPasswordPayload {
  current_password: string;
  new_password: string;
  [property: string]: unknown;
}


// --- Task Types ---

export interface Task {
  id: number;
  title: string;
  description: string;
  date: string;
  created_at?: string;
  updated_at?: string;
  assigned_to?: number[];
}

export interface TaskCreatePayload {
  title: string;
  description: string;
  date: string;
  users?: number[];  // Used by backend for creation
  assigned_to?: number[]; // Used for display/edit if needed, but backend expects 'users' for creation
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  date?: string;
  assigned_to?: number[];
}

export interface TaskDetail extends Task {
  submissions: TaskSubmissionDetail[];
}

// --- Submission Types ---

export type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'MISSED' | 'pending' | 'submitted' | 'missed' | 'pen' | 'sub' | 'mis';

export interface Feedback {
  id: number;
  task_sub: number;
  note: string;
  score: number;
  created_at?: string;
}

export interface FeedbackCreatePayload {
  task_sub: number;
  note: string;
  score: number;
}

// Admin View of a Submission (e.g. in TaskDetail or List)
export interface TaskSubmissionDetail {
  id: number;
  task: number; // ID
  user: { id: number; first_name: string; last_name: string; email: string };
  submitted_at: string; // spec says submitted_at
  note: string;
  task_url: string;
  status: SubmissionStatus;
  feedback: Feedback | null;
}

// Member View of a Submission
export interface MemberSubmission {
  id: number;
  task: Task; // Nested Task object
  submitted_at: string;
  note: string;
  task_url: string;
  status: SubmissionStatus;
  feedback: Feedback | null;
}

export interface MemberSubmissionUpdatePayload {
  note?: string | null;
  task_url?: string | null;
  status?: SubmissionStatus;
}

export interface SubmissionCreatePayload {
  task: number;
  task_url: string;
  note?: string;
  status?: SubmissionStatus;
}

// Union for generic use where we handle both
export type Submission = TaskSubmissionDetail | MemberSubmission;

// --- Legacy Types (kept for compatibility) ---
export interface LegacyUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  committee: string;
  avatar?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  progress: number;
  attendance: number;
  isBest: boolean;
  tasksSubmitted: number;
  adminNotes?: string;
}

export interface Announcement {
  id: number;
  title: string;
  description: string;
  is_pinned: boolean;
  link?: string | null;
  created_at: string;
  author_name?: string; // Optional if not provided by API directly
}

export interface AnnouncementCreatePayload {
  title: string;
  description: string;
  is_pinned?: boolean;
}

// Member Minimal (for nested responses)
export interface MemberMinimal {
  email?: string;
  first_name?: string;
  id?: number;
  last_name?: string;
  [property: string]: unknown;
}

// Week Progress tracking for individual items
export interface WeekProgress {
  id?: number;
  is_finished?: boolean;
  notes?: null | string;
  user?: MemberMinimal;
  [property: string]: unknown;
}

// Week Item (resource within a week - Member View)
// Typically shows progress for the current user
export interface WeekItem {
  id?: number;
  notes?: null | string;
  resource?: null | string; // Resource URL
  title: string;
  week_progress?: WeekProgress[];
  [property: string]: unknown;
}

// Week Item Admin Detail (GET admin/items/{id}/)
// Shows progress for all assigned users
export interface WeekItemAdminDetail {
  id?: number;
  week?: number; // Added week ID
  notes?: string | null;
  resource?: string | null;
  title: string;
  users?: {
    user: number;
    user_details?: MemberMinimal;
  }[];
  week_progress?: WeekProgress[]; // Array of progress for all users
}

// Member-specific progress (GET member/weeks/)
export interface MemberProgress {
  id?: number;
  is_finished?: boolean;
  notes?: null | string;
  [property: string]: unknown;
}

export interface MemberProgressUpdate {
  is_finished?: boolean;
  notes?: null | string;
  [property: string]: unknown;
}

export interface MemberItem {
  id?: number;
  notes?: string;
  resource?: string;
  title?: string;
  week_progress?: MemberProgress[];
  [property: string]: unknown;
}

export interface MemberWeekDetail {
  end_date?: Date;
  id?: number;
  items?: MemberItem[];
  number?: number;
  start_date?: Date;
  title?: string;
  [property: string]: unknown;
}

// Week Detail (GET admin/weeks/ and GET weeks/{id}/)
export interface WeekDetail {
  committee?: number;
  end_date: Date;
  id?: number;
  week_items?: WeekItem[];
  number: number; // Unique week number
  start_date: Date;
  title: string;
  [property: string]: unknown;
}

export interface PaginatedWeekList {
  count?: number;
  next?: null | string;
  previous?: null | string;
  results?: WeekDetail[];
  [property: string]: unknown;
}

// Week Create/Update Payload
export interface WeekCreatePayload {
  end_date?: string | Date;
  number?: number;
  start_date?: string | Date;
  title?: string;
  [property: string]: unknown;
}

// Progress Create Payload (POST admin/progress/)
export interface ProgressCreatePayload {
  is_finished?: boolean;
  notes?: string;
  user: number;
  week_item: number;
  [property: string]: unknown;
}

// Week Item Create Payload (POST admin/items/)
export interface WeekItemCreatePayload {
  notes?: string | null;
  resource?: string | null;
  title: string;
  users: number[]; // Array of User IDs
  week: number; // Week ID
}

// Legacy interface for backward compatibility with existing UI
export interface WeekContent {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  notes?: string;
  slides?: string;
  challengeLink?: string;
  formLink?: string;
  quizLink?: string;
  adminFeedback?: string;
  isCompleted: boolean;
  assignmentSubmitted?: boolean;
  assignmentLink?: string;
  items?: WeekItem[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  requirements?: string[];
  deadline?: string;
  status: 'pending' | 'submitted' | 'reviewed';
  feedback?: string;
  grade?: string;
  isBest?: boolean;
  submittedAt?: string;
}

export interface Session {
  id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  type: 'online' | 'offline';
  note?: string;
  attendance: Attendance[];
}

export interface Attendance {
  id: number;
  user: number | { id: number; first_name: string; last_name: string; email: string };
  session: number;
  status: boolean;
  pay_fees: boolean;
  recorded_at: string;
}

export interface SessionCreatePayload {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  type: 'online' | 'offline';
  note?: string;
}

export interface AttendanceUpdatePayload {
  status?: boolean;
  pay_fees?: boolean;
}

export interface LegacySession {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'online' | 'offline';
  attendees: string[]; 
}

export interface AttendanceRecord {
  sessionId: string;
  sessionName: string;
  date: string;
  attended: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface MemberProgressStats {
  userId: string;
  completedWeeks: number;
  totalWeeks: number;
  attendancePercentage: number;
  projectsSubmitted: number;
  achievements: Achievement[];
}
