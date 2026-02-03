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
  committee: string;
  created_at: string;
  created_by: number; // user id
  // Add other fields if returned by API
}

export interface TaskCreatePayload {
  title: string;
  description: string;
  committee: string;
}

export type SubmissionStatus = 'pen' | 'sub' | 'mis'; // Pending, Submitted, Missing

export interface Submission {
  id: number;
  task: number; // task id
  user: number; // user id
  task_url: string;
  note?: string;
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
}

export interface SubmissionCreatePayload {
  task: number; // task id
  task_url: string;
  note?: string;
  status: SubmissionStatus;
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
