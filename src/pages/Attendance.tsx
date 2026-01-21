import { useState, useMemo } from 'react';
import { mockSessions, mockMembers } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Session, Member } from '@/types';
import { AddSessionDialog } from '@/components/dialogs/AddSessionDialog';
import { MarkAttendanceDialog } from '@/components/dialogs/MarkAttendanceDialog';
import {
  CalendarCheck,
  BarChart3,
  Plus,
  Users,
  Monitor,
  MapPin,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
} from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const memberAttendance = useMemo(() => {
    return members.map((member) => {
      const sessionsAttended = sessions.filter((s) =>
        s.attendees.includes(member.id)
      ).length;
      const percentage =
        sessions.length > 0
          ? Math.round((sessionsAttended / sessions.length) * 100)
          : 0;
      return { ...member, sessionsAttended, attendance: percentage };
    });
  }, [members, sessions]);

  const totalSessions = sessions.length;
  const requiredAttendance = 75; // Minimum attendance percentage required

  // Current user's attendance stats (for member view)
  const currentMemberStats = useMemo(() => {
    if (!user) return null;
    const memberData = memberAttendance.find(m => m.id === user.id) || memberAttendance[0];
    return memberData;
  }, [memberAttendance, user]);

  const avgAttendance = useMemo(() => {
    if (totalSessions === 0 || members.length === 0) return 0;
    const totalAttendees = sessions.reduce((sum, s) => sum + s.attendees.length, 0);
    return Math.round((totalAttendees / (totalSessions * members.length)) * 100);
  }, [sessions, members]);

  const handleAddSession = (sessionData: Omit<Session, 'id' | 'attendees'>) => {
    const newSession: Session = {
      ...sessionData,
      id: Date.now().toString(),
      attendees: [],
    };
    setSessions((prev) => [...prev, newSession]);
    toast({
      title: 'Session Added',
      description: `"${sessionData.title}" has been created.`,
    });
  };

  const handleMarkAttendance = (session: Session) => {
    setSelectedSession(session);
    setIsMarkDialogOpen(true);
  };

  const handleSaveAttendance = (sessionId: string, attendees: string[]) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, attendees } : s))
    );

    setMembers((prev) =>
      prev.map((member) => {
        const sessionsAttended = sessions
          .map((s) => (s.id === sessionId ? { ...s, attendees } : s))
          .filter((s) => s.attendees.includes(member.id)).length;
        const newAttendance =
          sessions.length > 0
            ? Math.round((sessionsAttended / sessions.length) * 100)
            : 0;
        return { ...member, attendance: newAttendance };
      })
    );

    toast({
      title: 'Attendance Updated',
      description: `Marked ${attendees.length} members as present.`,
    });
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            {isAdmin ? 'Attendance Management' : 'Attendance History'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isAdmin
              ? 'Create sessions and track member attendance'
              : 'View your attendance record and statistics'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Add Session
          </Button>
        )}
      </div>

      {/* Stats - Different for Admin vs Member */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card
            className="border-border/50 hover-lift animate-fade-in"
            style={{ animationDelay: '0.05s' }}
          >
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Sessions
                  </p>
                  <p className="text-xl sm:text-3xl font-bold text-foreground mt-1">
                    {totalSessions}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
                  <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-border/50 hover-lift animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Average Attendance
                  </p>
                  <p className="text-xl sm:text-3xl font-bold text-foreground mt-1">
                    {avgAttendance}%
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <Progress value={avgAttendance} className="h-2 mt-4" />
            </CardContent>
          </Card>

          <Card
            className="border-border/50 hover-lift animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Members
                  </p>
                  <p className="text-xl sm:text-3xl font-bold text-foreground mt-1">
                    {members.length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Member Stats */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card
            className="border-border/50 hover-lift animate-fade-in"
            style={{ animationDelay: '0.05s' }}
          >
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Sessions Attended
                  </p>
                  <p className="text-xl sm:text-3xl font-bold text-foreground mt-1">
                    {currentMemberStats?.sessionsAttended || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    out of {totalSessions} total
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-border/50 hover-lift animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Your Attendance
                  </p>
                  <p className={`text-xl sm:text-3xl font-bold mt-1 ${
                    (currentMemberStats?.attendance || 0) >= requiredAttendance
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {currentMemberStats?.attendance || 0}%
                  </p>
                </div>
                <div className={`p-2 sm:p-3 rounded-xl ${
                  (currentMemberStats?.attendance || 0) >= requiredAttendance
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <BarChart3 className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    (currentMemberStats?.attendance || 0) >= requiredAttendance
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`} />
                </div>
              </div>
              <Progress 
                value={currentMemberStats?.attendance || 0} 
                className={`h-2 mt-4 ${
                  (currentMemberStats?.attendance || 0) < requiredAttendance
                    ? '[&>div]:bg-red-500'
                    : ''
                }`}
              />
            </CardContent>
          </Card>

          <Card
            className="border-border/50 hover-lift animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Sessions Missed
                  </p>
                  <p className="text-xl sm:text-3xl font-bold text-foreground mt-1">
                    {totalSessions - (currentMemberStats?.sessionsAttended || 0)}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-border/50 hover-lift animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Required
                  </p>
                  <p className="text-xl sm:text-3xl font-bold text-foreground mt-1">
                    {requiredAttendance}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    minimum attendance
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Program Requirements (Member Only) */}
      {!isAdmin && (
        <Card
          className={`border-2 animate-fade-in ${
            (currentMemberStats?.attendance || 0) >= requiredAttendance
              ? 'border-green-500/30 bg-green-50/50 dark:bg-green-900/10'
              : 'border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10'
          }`}
          style={{ animationDelay: '0.25s' }}
        >
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                (currentMemberStats?.attendance || 0) >= requiredAttendance
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-orange-100 dark:bg-orange-900/30'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  (currentMemberStats?.attendance || 0) >= requiredAttendance
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">
                  {(currentMemberStats?.attendance || 0) >= requiredAttendance
                    ? '✓ Meeting Program Requirements'
                    : '⚠ Below Required Attendance'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {(currentMemberStats?.attendance || 0) >= requiredAttendance
                    ? `Great job! You're maintaining the required ${requiredAttendance}% attendance rate. Keep up the good work to stay eligible for the program.`
                    : `Your attendance is ${currentMemberStats?.attendance || 0}%, which is below the required ${requiredAttendance}%. Please attend more sessions to maintain your eligibility in the program.`}
                </p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs font-medium text-muted-foreground">Program Requirements:</p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>• Minimum {requiredAttendance}% attendance required</li>
                    <li>• Missing 3+ consecutive sessions may require review</li>
                    <li>• Notify admin in advance if unable to attend</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions List / Session History */}
      <Card
        className="border-border/50 animate-fade-in"
        style={{ animationDelay: isAdmin ? '0.2s' : '0.3s' }}
      >
        <CardHeader>
          <CardTitle className="text-lg font-heading">
            {isAdmin ? 'Sessions' : 'Session History'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No sessions created yet.
              </p>
            ) : (
              sessions.map((session, index) => {
                const memberAttended = !isAdmin && user 
                  ? session.attendees.includes(user.id) || session.attendees.includes(memberAttendance[0]?.id || '')
                  : false;
                
                return (
                  <div
                    key={session.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between p-4 rounded-lg border transition-colors animate-slide-in ${
                      !isAdmin
                        ? memberAttended
                          ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30'
                          : 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
                        : 'bg-muted/50 border-border/50 hover:border-primary/30'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      {!isAdmin ? (
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            memberAttended
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : 'bg-red-100 dark:bg-red-900/30'
                          }`}
                        >
                          {memberAttended ? (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      ) : (
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            session.type === 'online'
                              ? 'bg-blue-100 dark:bg-blue-900/30'
                              : 'bg-orange-100 dark:bg-orange-900/30'
                          }`}
                        >
                          {session.type === 'online' ? (
                            <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          )}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm sm:text-base">{session.title}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                          <span>
                            {new Date(session.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <Badge variant="outline" className="capitalize text-xs">
                            {session.type}
                          </Badge>
                          {!isAdmin && (
                            <Badge 
                              variant={memberAttended ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {memberAttended ? 'Attended' : 'Missed'}
                            </Badge>
                          )}
                        </div>
                        {session.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">
                            {session.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 justify-between sm:justify-end ml-11 sm:ml-0">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                        <UserCheck className="w-4 h-4" />
                        <span>
                          {session.attendees.length}/{members.length}
                        </span>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAttendance(session)}
                          className="text-xs sm:text-sm"
                        >
                          Mark
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Member Attendance Overview (Admin Only) */}
      {isAdmin && (
        <Card
          className="border-border/50 animate-fade-in"
          style={{ animationDelay: '0.25s' }}
        >
          <CardHeader>
            <CardTitle className="text-lg font-heading">
              Member Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {memberAttendance.map((member, index) => (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between p-4 rounded-lg bg-muted/50 border border-border/50 animate-slide-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm sm:text-base truncate">{member.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {member.sessionsAttended} of {totalSessions} sessions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-13 sm:ml-0">
                    <div className="w-24 sm:w-32">
                      <Progress value={member.attendance} className="h-2" />
                    </div>
                    <Badge
                      variant={member.attendance >= 80 ? 'default' : 'secondary'}
                      className={`min-w-[48px] justify-center ${
                        member.attendance < 80
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : ''
                      }`}
                    >
                      {member.attendance}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AddSessionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddSession}
      />
      <MarkAttendanceDialog
        open={isMarkDialogOpen}
        onOpenChange={setIsMarkDialogOpen}
        session={selectedSession}
        members={members}
        onSave={handleSaveAttendance}
      />
    </div>
  );
}
