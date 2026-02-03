export type UserRole = 'admin' | 'member';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  committee: string;
  created_at: string;
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

// --- Task Types ---

export interface Task {
  id: number;
  title: string;
  description: string;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskCreatePayload {
  title: string;
  description: string;
  date: string;
  // Admin might assign users, but spec says "assigned_to" in previous turn, 
  // though new spec only lists title, description, date for Update. 
  // We'll keep assigned_to as optional if implemented.
  assigned_to?: number[]; 
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

export type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'MISSED';

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
  note?: string;
  task_url?: string;
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

export interface MemberProgress {
  userId: string;
  completedWeeks: number;
  totalWeeks: number;
  attendancePercentage: number;
  projectsSubmitted: number;
  achievements: Achievement[];
}
