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
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAnnouncements } from '@/features/announcements/hooks';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { data: announcements = [] } = useAnnouncements();

  const currentWeek = mockWeekContent.find((w) => !w.isCompleted) || mockWeekContent[0];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="space-y-1 sm:space-y-2 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
          Welcome back, {user?.first_name}!
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
              value={mockMembers.length}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Avg. Attendance"
              value="87%"
              icon={CalendarCheck}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Content Published"
              value={`${mockWeekContent.length} Weeks`}
              icon={BookOpen}
            />
            <StatCard
              title="Active Projects"
              value={3}
              icon={TrendingUp}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Weeks Completed"
              value={`${mockMemberProgress.completedWeeks}/${mockMemberProgress.totalWeeks}`}
              icon={BookOpen}
            />
            <StatCard
              title="Attendance"
              value={`${mockMemberProgress.attendancePercentage}%`}
              icon={CalendarCheck}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Projects Submitted"
              value={mockMemberProgress.projectsSubmitted}
              icon={TrendingUp}
            />
            <StatCard
              title="Achievements"
              value={mockMemberProgress.achievements.length}
              icon={Trophy}
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
          <AnnouncementCard announcements={announcements} />
        </div>
      </div>
    </div>
  );
}
