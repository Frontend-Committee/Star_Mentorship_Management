import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/dashboard/StatCard';
import ProgressCard from '@/components/dashboard/ProgressCard';
import AnnouncementCard from '@/components/dashboard/AnnouncementCard';
import AchievementBadge from '@/components/dashboard/AchievementBadge';
import WeeklyTaskCard from '@/components/dashboard/WeeklyTaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  mockAnnouncements,
  mockWeekContent,
  mockMemberProgress,
  mockMembers,
} from '@/data/mockData';
import {
  BookOpen,
  Users,
  Trophy,
  CalendarCheck,
  TrendingUp,
  Star,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUsers } from '@/features/auth/hooks';
import { useAdminSessions, useMemberAttendance } from '@/features/sessions/hooks';
import { useAdminTasks, useMemberTasks } from '@/features/tasks/hooks';
import { useSubmissions } from '@/features/submissions/hooks';
import { useMemo } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // --- Data Fetching ---
  const { data: users = [] } = useUsers();
  const { data: adminSessions = [] } = useAdminSessions({ enabled: isAdmin });
  const { data: adminTasks = [] } = useAdminTasks({ enabled: isAdmin });
  
  const { data: memberAttendance = [] } = useMemberAttendance({ enabled: !isAdmin });
  const { data: memberTasks = [] } = useMemberTasks({ enabled: !isAdmin });
  const { data: memberSubmissions = [] } = useSubmissions(); // Assuming this works for members

  // --- Admin Stats Calculation ---
  const adminStats = useMemo(() => {
    if (!isAdmin) return null;

    const totalMembers = users.length;
    
    // Calculate Average Attendance
    let totalAttendancePercentage = 0;
    let sessionsWithAttendance = 0;

    adminSessions.forEach(session => {
      if (session.attendance && session.attendance.length > 0) {
        const presentCount = session.attendance.filter(a => a.status).length;
        const sessionPercentage = (presentCount / session.attendance.length) * 100;
        totalAttendancePercentage += sessionPercentage;
        sessionsWithAttendance++;
      }
    });

    const avgAttendance = sessionsWithAttendance > 0 
      ? Math.round(totalAttendancePercentage / sessionsWithAttendance) 
      : 0;

    const activeTasks = adminTasks.length; // Or filter by date/status if applicable

    return {
      totalMembers,
      avgAttendance,
      activeTasks
    };
  }, [isAdmin, users, adminSessions, adminTasks]);

  // --- Member Stats Calculation ---
  const memberStats = useMemo(() => {
    if (isAdmin) return null;

    // Attendance
    const attendedCount = memberAttendance.filter(a => a.status).length;
    const totalSessions = memberAttendance.length;
    const attendancePercentage = totalSessions > 0 
      ? Math.round((attendedCount / totalSessions) * 100) 
      : 0;

    // Tasks & Submissions
    const totalTasks = memberTasks.length;
    const submittedCount = memberSubmissions.length; // Assuming 1 submission per task usually
    // Or check tasks status if task object has it? 
    // Usually tasks are static, submissions track status.
    // Let's rely on submissions count for "Projects/Tasks Submitted".
    
    // Mocking weeks for now as we don't have dynamic weeks
    const completedWeeks = mockMemberProgress.completedWeeks;
    
    return {
      attendancePercentage,
      submittedCount,
      completedWeeks
    };
  }, [isAdmin, memberAttendance, memberTasks, memberSubmissions]);

  const currentWeek = mockWeekContent.find((w) => !w.isCompleted) || mockWeekContent[0];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="space-y-1 sm:space-y-2 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
          Welcome back, {user?.first_name || user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {isAdmin
            ? "Here's an overview of your committee's progress"
            : "Track your learning journey and stay up to date"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isAdmin ? (
          <>
            <StatCard
              title="Total Members"
              value={adminStats?.totalMembers || 0}
              icon={Users}
              trend={{ value: users.length > 0 ? 100 : 0, isPositive: true }} // Placeholder trend
            />
            <StatCard
              title="Avg. Attendance"
              value={`${adminStats?.avgAttendance || 0}%`}
              icon={CalendarCheck}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Content Published"
              value={`${mockWeekContent.length} Weeks`} // Keeping mock for static content
              icon={BookOpen}
            />
            <StatCard
              title="Active Tasks"
              value={adminStats?.activeTasks || 0}
              icon={TrendingUp}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Weeks Completed"
              value={`${memberStats?.completedWeeks || 0}/${mockWeekContent.length}`}
              icon={BookOpen}
            />
            <StatCard
              title="Attendance"
              value={`${memberStats?.attendancePercentage || 0}%`}
              icon={CalendarCheck}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Tasks Submitted"
              value={memberStats?.submittedCount || 0}
              icon={CheckCircle}
            />
            <StatCard
              title="Pending Tasks"
              value={(memberTasks.length - (memberStats?.submittedCount || 0)) > 0 ? (memberTasks.length - (memberStats?.submittedCount || 0)) : 0}
              icon={Clock}
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Progress Overview */}
          {!isAdmin && (
            <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-heading">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Overall Completion</span>
                      <span className="font-medium text-foreground">
                        {Math.round((mockMemberProgress.completedWeeks / mockMemberProgress.totalWeeks) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(mockMemberProgress.completedWeeks / mockMemberProgress.totalWeeks) * 100}
                      className="h-2 sm:h-3"
                    />
                  </div>
                  
                  {/* Achievements */}
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm font-medium text-foreground">Achievements Earned</p>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {mockMemberProgress.achievements.map((achievement) => (
                        <AchievementBadge key={achievement.id} achievement={achievement} />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin: Member Overview */}
          {isAdmin && (
            <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-heading">Member Progress</CardTitle>
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {mockMembers.slice(0, 5).map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 sm:gap-4 animate-slide-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium text-xs sm:text-sm shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {member.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={member.progress} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground w-7 sm:w-8 text-right">
                            {member.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Attendance</p>
                        <p className="text-sm font-medium text-foreground">{member.attendance}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Week Task */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <WeeklyTaskCard currentWeek={currentWeek} />
          </div>
        </div>

        {/* Right Column - Announcements */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <AnnouncementCard announcements={mockAnnouncements} />
        </div>
      </div>
    </div>
  );
}
