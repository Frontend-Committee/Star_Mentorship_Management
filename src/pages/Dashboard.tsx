import AchievementBadge from '@/components/dashboard/AchievementBadge';
import AnnouncementCard from '@/components/dashboard/AnnouncementCard';
import StatCard from '@/components/dashboard/StatCard';
import WeeklyTaskCard from '@/components/dashboard/WeeklyTaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useAdminSessions, useMemberAttendance } from '@/features/sessions/hooks';
import { useSubmissions } from '@/features/submissions/hooks';
import { useAdminSubmissions, useAdminTasks, useMemberTasks } from '@/features/tasks/hooks';
import { useMembersWithProgress } from '@/features/members/hooks';
import { useCommitteeDetails } from '@/features/committees/hooks';
import {
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';
import { useMemo } from 'react';
import { useAnnouncements } from '@/features/announcements/hooks';
import { useWeeks } from '@/features/weeks/hooks';
import { WeekContent } from '@/types';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // --- Data Fetching ---
  const { data: committee } = useCommitteeDetails();
  const referenceId = committee?.reference_id;

  const { data: membersResponse, isLoading: isLoadingUsers } = useMembersWithProgress({ enabled: isAdmin });
  const users = useMemo(() => membersResponse?.results || [], [membersResponse]);
  const { data: adminSessions = [], isLoading: isLoadingSess } = useAdminSessions({ enabled: isAdmin });
  const { data: adminTasks = [], isLoading: isLoadingTasks } = useAdminTasks({ enabled: isAdmin });
  const { data: adminSubmissions = [], isLoading: isLoadingSubmissions } = useAdminSubmissions({ enabled: isAdmin });
 
  const { data: memberAttendance = [], isLoading: isLoadingAtt } = useMemberAttendance(referenceId, { enabled: !isAdmin });
  const { data: memberTasks = [], isLoading: isLoadingMTasks } = useMemberTasks({ enabled: !isAdmin });
  const { data: memberSubmissions = [], isLoading: isLoadingMSubs } = useSubmissions();
  const { data: apiWeeks = [], isLoading: isLoadingWeeks } = useWeeks(user?.role);
  const { data: announcements = [], isLoading: isLoadingAnnouncements } = useAnnouncements();

  const isLoading = isLoadingUsers || isLoadingWeeks || isLoadingAnnouncements || 
                    (isAdmin ? (isLoadingSess || isLoadingTasks || isLoadingSubmissions) : (isLoadingAtt || isLoadingMTasks || isLoadingMSubs));

  // --- Admin Stats Calculation ---
  const adminStats = useMemo(() => {
    if (!isAdmin) return null;

    const totalMembers = membersResponse?.count || users.length;

    // Calculate Average Attendance
    let totalAttendancePercentage = 0;
    let sessionsWithAttendance = 0;

    adminSessions.forEach(session => {
      if (session.attendance && session.attendance.length > 0) {
        const presentCount = session.attendance.filter(a => typeof a.user === 'object' ? a.status : a.status).length;
        const sessionPercentage = (presentCount / session.attendance.length) * 100;
        totalAttendancePercentage += sessionPercentage;
        sessionsWithAttendance++;
      }
    });

    const avgAttendance = sessionsWithAttendance > 0
      ? Math.round(totalAttendancePercentage / sessionsWithAttendance)
      : 0;

    const activeTasks = adminTasks.length;

    // Calculate Member Progress for List
    const memberProgressList = users.slice(0, 5).map(member => {
      return {
        ...member,
        attendance: member.session_attendance || 0,
        progress: member.week_progress || 0
      };
    });

    return {
      totalMembers,
      avgAttendance,
      activeTasks,
      memberProgressList
    };
  }, [isAdmin, users, adminSessions, adminTasks, membersResponse?.count]);

  // Transform API weeks to UI format
  const weeks = useMemo<WeekContent[]>(() => {
    if (!apiWeeks) return [];

    return apiWeeks.map((week: import('@/types').WeekDetail | import('@/types').MemberWeekDetail) => {
      const adminWeek = week as import('@/types').WeekDetail;
      const memberWeek = week as import('@/types').MemberWeekDetail;
      const items = (adminWeek.week_items || memberWeek.items || []) as (import('@/types').WeekItemAdminDetail | import('@/types').MemberItem)[];
      
      const isCompleted = items.length > 0 && items.every((item) => {
        const itemWithProgress = item as { week_progress?: import('@/types').WeekProgress[] };
        const progressArr = itemWithProgress.week_progress || [];
        return Array.isArray(progressArr) && progressArr.some((p) => 
          p.is_finished && (!user?.id || p.user?.id === user.id || !p.user)
        );
      });

      
      
      const weekNumber = (week as { number?: number }).number || 0;
      const firstItem = items[0] as { notes?: string; title?: string };
      
      return {
        id: week.id?.toString() ?? `week-${weekNumber}`,
        weekNumber,
        title: week.title || '',
        description: firstItem?.notes || firstItem?.title || '', 
        isCompleted,
        items: items,
        notes: items.find((item) => item.title?.toLowerCase().includes('note'))?.resource || null,
        slides: items.find((item) => item.title?.toLowerCase().includes('slide'))?.resource || null,
        challengeLink: items.find((item) => item.title?.toLowerCase().includes('challenge'))?.resource || null,
        formLink: items.find((item) => item.title?.toLowerCase().includes('form'))?.resource || null,
      };
    });
  }, [apiWeeks, user?.id]);

  // --- Member Stats Calculation ---
  const memberStats = useMemo(() => {
    if (isAdmin) return null;

    const attendedCount = memberAttendance.filter(a => a.status).length;
    const totalSessions = memberAttendance.length;
    const attendancePercentage = totalSessions > 0
      ? Math.round((attendedCount / totalSessions) * 100)
      : 0;

    const submittedCount = memberSubmissions.length;

    const completedWeeksCount = weeks.filter(w => w.isCompleted).length;
    const totalWeeksCount = weeks.length;
    const curriculumProgress = totalWeeksCount > 0 
      ? Math.round((completedWeeksCount / totalWeeksCount) * 100) 
      : 0;

    return {
      attendancePercentage,
      submittedCount,
      completedWeeks: completedWeeksCount,
      totalWeeksCount,
      curriculumProgress
    };
  }, [isAdmin, memberAttendance, memberSubmissions, weeks]);

  const currentWeek = useMemo(() => {
    if (weeks.length === 0) return null;
    const incomplete = weeks.find((w) => !w.isCompleted);
    return incomplete || weeks[weeks.length - 1];
  }, [weeks]);



  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="space-y-1 sm:space-y-2 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
          Welcome back, {user?.first_name || 'User'}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {isAdmin
            ? `Here's an overview of ${committee?.name || 'your committee'}'s progress`
            : `Track your learning journey in ${committee?.name || 'the committee'} and stay up to date`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {isAdmin ? (
          <>
            <StatCard
              title="Total Members"
              value={adminStats?.totalMembers || 0}
              icon={Users}
              trend={{ value: users.length > 0 ? 100 : 0, isPositive: true }}
            />
            <StatCard
              title="Content Published"
              value={`${weeks.length} Weeks`}
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
              value={`${memberStats?.completedWeeks || 0}/${memberStats?.totalWeeksCount || 0}`}
              icon={BookOpen}
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
                        {memberStats?.curriculumProgress || 0}%
                      </span>
                    </div>
                    <Progress
                      value={memberStats?.curriculumProgress || 0}
                      className="h-2 sm:h-3"
                    />
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
                  {adminStats?.memberProgressList.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 sm:gap-4 animate-slide-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium text-xs sm:text-sm shrink-0">
                        {member.first_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                            {member.first_name} {member.last_name}
                          </p>
                          {member.level && (
                             <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4 bg-primary/10 text-primary border-none">
                               L{member.level}
                             </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={member.progress} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground w-7 sm:w-8 text-right">
                            {member.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!adminStats?.memberProgressList || adminStats.memberProgressList.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center">No members found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Week Task */}
          {currentWeek && (
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <WeeklyTaskCard currentWeek={currentWeek} />
            </div>
          )}
        </div>

        {/* Right Column - Announcements */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <AnnouncementCard announcements={announcements} />
        </div>
      </div>
    </div>
  );
}
