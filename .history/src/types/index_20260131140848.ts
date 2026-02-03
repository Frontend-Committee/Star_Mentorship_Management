export type UserRole = 'admin' | 'member';

export interface User {
  id: number; // API uses integer ID usually, but user said "id" in response example. Assuming number or string. Let's assume number based on typical Django setup, but user example didn't specify type. Let's use string | number or just number if sure. Django default is number. User example response: { id, first_name ... }. Let's assume number for now, or string if UUID. Given "pythonanywhere", likely default AutoField (int).
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole; // assuming backend returns 'admin' or 'member' strings
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

// Keeping existing interfaces for now to prevent breaking existing UI, but marking them as potentially legacy if they conflict.
// The user provided specific requirements for new integration.

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
  users?: number[];
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  date?: string;
  assigned_to?: number[];
}

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

export interface Submission {
  id: number;
  task: number;
  user: number | { id: number; first_name: string; last_name: string; email: string };
  task_url: string;
  note?: string;
  status: SubmissionStatus;
  feedback?: Feedback | null;
  created_at?: string;
  updated_at?: string;
}

export interface SubmissionCreatePayload {
  task: number;
  task_url: string;
  note?: string;
  status?: SubmissionStatus;
}

// Legacy types (kept for compatibility with existing components if any)
export interface LegacyUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  committee: string;
  avatar?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  deadline?: string;
  createdAt: string;
  author: string;
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
  user: number | { id: number; first_name: string; last_name: string; email: string }; // API might return ID or object depending on depth, assuming object based on "user" in description usually implies nested or ID. User said "user" in "Attendance object inside session". Let's assume it might be ID or minimal user obj. "returns ... attendance[] for all members".
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

// Legacy types (kept for compatibility with existing components if any)
export interface LegacySession {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'online' | 'offline';
  attendees: string[]; // member IDs who attended
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

export interface Member {
  id: string;
  name: string;
  email: string;
  progress: number;
  attendance: number;
  isBest?: boolean;
  assignmentsSubmitted?: number;
  projectsCompleted?: number;
  adminNotes?: string;
}
