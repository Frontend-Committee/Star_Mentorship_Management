export type UserRole = 'admin' | 'member';

export interface User {
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
