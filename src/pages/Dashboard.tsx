import AchievementBadge from '@/components/dashboard/AchievementBadge';
import AnnouncementCard from '@/components/dashboard/AnnouncementCard';
import StatCard from '@/components/dashboard/StatCard';
import WeeklyTaskCard from '@/components/dashboard/WeeklyTaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useAdminSessions } from '@/features/sessions/hooks';
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
  LayoutList,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';
import { useMemo } from 'react';
import { useAnnouncements } from '@/features/announcements/hooks';
import { useWeeks } from '@/features/weeks/hooks';
import { WeekContent } from '@/types';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // --- Data Fetching ---
  const { data: committee } = useCommitteeDetails();
  const committeeSlug = committee?.reference_id || 'front_committee';
  const referenceId = committee?.reference_id;

  const { data: membersResponse, isLoading: isLoadingUsers } = useMembersWithProgress({ enabled: isAdmin });
  const users = useMemo(() => membersResponse?.results || [], [membersResponse]);
  const { data: adminSessions = [], isLoading: isLoadingSess } = useAdminSessions(committeeSlug, { enabled: isAdmin });
  const { data: adminTasks = [], isLoading: isLoadingTasks } = useAdminTasks(undefined, { enabled: isAdmin });
  const { data: adminSubmissions = [], isLoading: isLoadingSubmissions } = useAdminSubmissions(undefined, { enabled: isAdmin });
 
  const { data: memberTasks = [], isLoading: isLoadingMTasks } = useMemberTasks(undefined, { enabled: !isAdmin });
  const { data: memberSubmissions = [], isLoading: isLoadingMSubs } = useSubmissions(undefined, { enabled: !isAdmin });
  const { data: apiWeeks = [], isLoading: isLoadingWeeks } = useWeeks(user?.role);
  const { data: announcements = [], isLoading: isLoadingAnnouncements } = useAnnouncements();

  const isLoading = isLoadingUsers || isLoadingWeeks || isLoadingAnnouncements || 
                    (isAdmin ? (isLoadingSess || isLoadingTasks || isLoadingSubmissions) : (isLoadingMTasks || isLoadingMSubs));

  // --- Admin Stats Calculation ---
  const adminStats = useMemo(() => {
    if (!isAdmin) return null;

    const totalMembers = membersResponse?.count || users.length;
    const activeTasks = adminTasks.length;

    // Calculate Member Progress for List
    const memberProgressList = users.map(member => {
      return {
        ...member,
        progress: member.week_progress || 0
      };
    });

    return {
      totalMembers,
      activeTasks,
      memberProgressList
    };
  }, [isAdmin, users, adminTasks, membersResponse?.count]);

  // Transform API weeks to UI format
  const weeks = useMemo<WeekContent[]>(() => {
    if (!apiWeeks) return [];

    return apiWeeks.map((week: import('@/types').WeekDetail | import('@/types').MemberWeekDetail) => {
      const adminWeek = week as import('@/types').WeekDetail;
      const memberWeek = week as import('@/types').MemberWeekDetail;
      const items = (adminWeek.week_items || memberWeek.items || []) as (import('@/types').WeekItemAdminDetail | import('@/types').MemberItem)[];
      
      const isCompleted = items.length > 0 && items.every((item) => {
        const itemWithProgress = item as { week_progress?: unknown };
        const wp = itemWithProgress.week_progress;
        if (!wp) return false;
        
        if (Array.isArray(wp)) {
          return wp.some((p: { user?: { id: number } | number; is_finished: boolean }) => {
            const progressUserId = typeof p.user === 'object' ? p.user?.id : p.user;
            const isOwnProgress = !progressUserId || String(progressUserId) === String(user?.id);
            return p.is_finished && isOwnProgress;
          });
        }
        
        // Single object format (Member API)
        return (wp as { is_finished: boolean }).is_finished;
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

    const submittedCount = memberSubmissions.length;

    const completedWeeksCount = weeks.filter(w => w.isCompleted).length;
    const totalWeeksCount = weeks.length;
    const curriculumProgress = totalWeeksCount > 0 
      ? Math.round((completedWeeksCount / totalWeeksCount) * 100) 
      : 0;

    return {
      submittedCount,
      completedWeeks: completedWeeksCount,
      totalWeeksCount,
      curriculumProgress
    };
  }, [isAdmin, memberSubmissions, weeks]);

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
      <div className={`grid gap-3 sm:gap-4 ${isAdmin ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2'}`}>
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
              className="col-span-2 lg:col-span-1"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Assigned Tasks"
              value={memberTasks.length}
              icon={LayoutList}
              className="col-span-1"
            />
            <StatCard
              title="Weeks"
              value={`${memberStats?.completedWeeks || 0}/${memberStats?.totalWeeksCount || 0}`}
              icon={BookOpen}
              className="col-span-1"
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
            <Card className="border-border/50 animate-fade-in flex flex-col" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary fill-primary/20" />
                  <CardTitle className="text-base sm:text-lg font-heading">Member Progress</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-8 gap-1 text-xs font-semibold text-primary bg-transparent hover:bg-primary hover:text-primary-foreground rounded-lg transition-all duration-200">
                  <Link to="/members">
                    View all
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0">
                <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-6 pt-0 space-y-1">
                  {adminStats?.memberProgressList.map((member, index) => (
                    <div
                      key={member.id}
                      className="group flex items-center gap-3 sm:gap-4 p-2.5 rounded-xl hover:bg-muted/40 transition-all duration-200 animate-slide-in cursor-default"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm shrink-0 border border-primary/10 group-hover:border-primary/20 transition-colors">
                          {member.first_name.charAt(0)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {member.first_name} {member.last_name}
                          </p>
                          <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                            {member.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted/80 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                            style={{ width: `${member.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!adminStats?.memberProgressList || adminStats.memberProgressList.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                      <Users className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-sm">No members found</p>
                    </div>
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
