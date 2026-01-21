import { Announcement, WeekContent, Project, AttendanceRecord, Achievement, MemberProgress, Session } from '@/types';

export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Project Deadline Extended',
    content: 'The final project deadline has been extended to next Friday. Make sure to submit your work on time!',
    isPinned: true,
    deadline: '2024-01-20',
    createdAt: '2024-01-10',
    author: 'Sarah Johnson',
  },
  {
    id: '2',
    title: 'Guest Speaker Session',
    content: 'We have a special guest speaker this week. Attendance is mandatory!',
    isPinned: false,
    createdAt: '2024-01-08',
    author: 'Sarah Johnson',
  },
  {
    id: '3',
    title: 'New Resources Available',
    content: 'Check out the new learning materials in Week 5. Additional practice exercises have been added.',
    isPinned: false,
    createdAt: '2024-01-05',
    author: 'Sarah Johnson',
  },
];

export const mockWeekContent: WeekContent[] = [
  {
    id: '1',
    weekNumber: 1,
    title: 'Introduction to Mentorship',
    description: 'Overview of the program, expectations, and getting started.',
    notes: 'https://example.com/notes/week1',
    slides: 'https://example.com/slides/week1',
    quizLink: 'https://example.com/quiz/week1',
    isCompleted: true,
    assignmentSubmitted: true,
    assignmentLink: 'https://docs.google.com/document/d/abc123',
    adminFeedback: 'Great start! You showed excellent understanding of the fundamentals.',
  },
  {
    id: '2',
    weekNumber: 2,
    title: 'Fundamentals & Core Concepts',
    description: 'Deep dive into core principles and fundamental concepts.',
    notes: 'https://example.com/notes/week2',
    slides: 'https://example.com/slides/week2',
    challengeLink: 'https://example.com/challenge/week2',
    quizLink: 'https://example.com/quiz/week2',
    isCompleted: true,
    assignmentSubmitted: true,
    adminFeedback: 'Good work on the concepts. Consider exploring the advanced topics next.',
  },
  {
    id: '3',
    weekNumber: 3,
    title: 'Practical Applications',
    description: 'Hands-on exercises and real-world applications.',
    notes: 'https://example.com/notes/week3',
    formLink: 'https://forms.google.com/week3',
    quizLink: 'https://example.com/quiz/week3',
    isCompleted: true,
    assignmentSubmitted: false,
  },
  {
    id: '4',
    weekNumber: 4,
    title: 'Advanced Topics',
    description: 'Exploring advanced concepts and best practices.',
    notes: 'https://example.com/notes/week4',
    slides: 'https://example.com/slides/week4',
    quizLink: 'https://example.com/quiz/week4',
    formLink: 'https://forms.google.com/week4',
    isCompleted: false,
  },
  {
    id: '5',
    weekNumber: 5,
    title: 'Project Workshop',
    description: 'Work session for final projects with mentor support.',
    formLink: 'https://forms.google.com/week5',
    isCompleted: false,
  },
  {
    id: '6',
    weekNumber: 6,
    title: 'Final Presentations',
    description: 'Present your projects and receive feedback.',
    isCompleted: false,
  },
];

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Personal Portfolio Website',
    description: 'Create a responsive portfolio showcasing your work. The portfolio should highlight your best projects, include an about section, and demonstrate your design skills.',
    requirements: [
      'Responsive design that works on mobile and desktop',
      'At least 3 project showcases with descriptions',
      'Contact form with validation',
      'About/Bio section with professional photo',
      'Clean and modern UI/UX design',
    ],
    deadline: '2024-01-15',
    status: 'reviewed',
    feedback: 'Excellent work! Great attention to detail and clean code structure.',
    grade: 'A',
    isBest: true,
    submittedAt: '2024-01-08',
  },
  {
    id: '2',
    title: 'Data Analysis Dashboard',
    description: 'Build an interactive dashboard using visualization libraries. The dashboard should display meaningful insights from a dataset of your choice.',
    requirements: [
      'Use at least 3 different chart types',
      'Implement filtering and sorting functionality',
      'Include data export feature (CSV/PDF)',
      'Responsive layout for different screen sizes',
      'Add tooltips and legends for better data understanding',
    ],
    deadline: '2024-01-25',
    status: 'submitted',
    submittedAt: '2024-01-12',
  },
  {
    id: '3',
    title: 'Final Capstone Project',
    description: 'Combine all learned skills into a comprehensive project. This is your opportunity to showcase everything you have learned throughout the mentorship program.',
    requirements: [
      'Full-stack application with frontend and backend',
      'User authentication and authorization',
      'Database integration with CRUD operations',
      'API documentation',
      'Deployment to a cloud platform',
      'README with setup instructions',
    ],
    deadline: '2024-02-10',
    status: 'pending',
  },
];

export const mockAttendance: AttendanceRecord[] = [
  { sessionId: '1', sessionName: 'Week 1 - Introduction', date: '2024-01-03', attended: true },
  { sessionId: '2', sessionName: 'Week 2 - Fundamentals', date: '2024-01-10', attended: true },
  { sessionId: '3', sessionName: 'Week 3 - Practice', date: '2024-01-17', attended: false },
  { sessionId: '4', sessionName: 'Week 4 - Advanced', date: '2024-01-24', attended: true },
];

export const mockSessions: Session[] = [
  { id: '1', title: 'Week 1 - Introduction', date: '2024-01-03', description: 'Overview of the program and getting started.', type: 'offline', attendees: ['1', '2', '3', '5'] },
  { id: '2', title: 'Week 2 - Fundamentals', date: '2024-01-10', description: 'Deep dive into core principles.', type: 'online', attendees: ['1', '2', '3', '4', '5'] },
  { id: '3', title: 'Week 3 - Practice', date: '2024-01-17', description: 'Hands-on exercises and applications.', type: 'offline', attendees: ['1', '3', '4', '5'] },
  { id: '4', title: 'Week 4 - Advanced', date: '2024-01-24', description: 'Exploring advanced concepts.', type: 'online', attendees: ['1', '2', '5'] },
];

export const mockAchievements: Achievement[] = [
  { id: '1', title: 'Fast Learner', description: 'Completed first 3 weeks ahead of schedule', icon: '🚀', earnedAt: '2024-01-15' },
  { id: '2', title: 'Perfect Attendance', description: 'Attended all sessions so far', icon: '⭐', earnedAt: '2024-01-20' },
  { id: '3', title: 'Top Performer', description: 'Ranked in top 10% of the cohort', icon: '🏆', earnedAt: '2024-01-22' },
];

export const mockMemberProgress: MemberProgress = {
  userId: '2',
  completedWeeks: 3,
  totalWeeks: 6,
  attendancePercentage: 75,
  projectsSubmitted: 2,
  achievements: mockAchievements,
};

export const mockMembers = [
  { id: '1', name: 'Alex Chen', email: 'alex@example.com', progress: 75, attendance: 90, isBest: false, assignmentsSubmitted: 4, projectsCompleted: 2, adminNotes: '' },
  { id: '2', name: 'Jordan Lee', email: 'jordan@example.com', progress: 60, attendance: 100, isBest: false, assignmentsSubmitted: 3, projectsCompleted: 1, adminNotes: 'Great attitude, needs more practice.' },
  { id: '3', name: 'Sam Taylor', email: 'sam@example.com', progress: 85, attendance: 75, isBest: false, assignmentsSubmitted: 5, projectsCompleted: 2, adminNotes: '' },
  { id: '4', name: 'Morgan Davis', email: 'morgan@example.com', progress: 45, attendance: 80, isBest: false, assignmentsSubmitted: 2, projectsCompleted: 0, adminNotes: 'At risk - needs follow up.' },
  { id: '5', name: 'Casey Wilson', email: 'casey@example.com', progress: 90, attendance: 95, isBest: true, assignmentsSubmitted: 5, projectsCompleted: 3, adminNotes: 'Top performer, consider for mentor role.' },
];
