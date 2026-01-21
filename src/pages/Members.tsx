import { mockMembers } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Member } from '@/types';
import { MemberProfileDialog } from '@/components/dialogs/MemberProfileDialog';
import { Search, Users, Mail, TrendingUp, CalendarCheck, Star, Crown, Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function Members() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleToggleBestMember = (id: string) => {
    setMembers(
      members.map((m) => ({
        ...m,
        isBest: m.id === id ? !m.isBest : false,
      }))
    );
  };

  const handleViewProfile = (member: Member) => {
    setSelectedMember(member);
    setIsProfileOpen(true);
  };

  const handleSaveNotes = (memberId: string, notes: string) => {
    setMembers(
      members.map((m) =>
        m.id === memberId ? { ...m, adminNotes: notes } : m
      )
    );
    toast({
      title: 'Notes saved',
      description: 'Internal notes have been updated.',
    });
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bestMember = members.find((m) => m.isBest);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Members</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage committee members
          </p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Best Member Highlight */}
      {bestMember && (
        <Card className="border-amber-400/50 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 w-fit">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Best Member of the Week</p>
                <p className="text-xl font-bold text-foreground">{bestMember.name}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <p className="text-lg font-bold text-foreground">{bestMember.progress}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Attendance</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{bestMember.attendance}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border/50 hover-lift">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground mt-1">{members.length}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avg. Progress</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground mt-1">
                  {Math.round(members.reduce((acc, m) => acc + m.progress, 0) / members.length)}%
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avg. Attendance</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground mt-1">
                  {Math.round(members.reduce((acc, m) => acc + m.attendance, 0) / members.length)}%
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover-lift">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">At Risk</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground mt-1">
                  {members.filter((m) => m.progress < 50 || m.attendance < 70).length}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card className="border-border/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="text-lg font-heading">All Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMembers.map((member, index) => (
              <div
                key={member.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg border transition-colors animate-slide-in ${
                  member.isBest
                    ? 'bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-400/50'
                    : 'bg-muted/50 border-border/50 hover:border-primary/30'
                }`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-medium text-sm">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground truncate">{member.name}</p>
                      {member.isBest && (
                        <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-xs">
                          <Star className="w-3 h-3 mr-1 fill-white" />
                          Best
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                      <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-13 sm:pl-0">
                  <div className="text-center min-w-[60px] sm:min-w-[80px]">
                    <p className="text-xs text-muted-foreground mb-1">Progress</p>
                    <div className="flex items-center gap-2">
                      <Progress value={member.progress} className="h-1.5 w-12 sm:w-16" />
                      <span className="text-xs sm:text-sm font-medium">{member.progress}%</span>
                    </div>
                  </div>

                  <div className="text-center min-w-[60px] sm:min-w-[80px]">
                    <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                    <span
                      className={`text-xs sm:text-sm font-medium ${
                        member.attendance >= 80
                          ? 'text-green-600 dark:text-green-400'
                          : member.attendance >= 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {member.attendance}%
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProfile(member)}
                        title="View Profile"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleBestMember(member.id)}
                        title={member.isBest ? 'Remove Best Member' : 'Mark as Best Member'}
                        className="h-8 w-8 p-0"
                      >
                        <Star className={`w-4 h-4 ${member.isBest ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No members found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Member Profile Dialog */}
      <MemberProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        member={selectedMember}
        onSaveNotes={handleSaveNotes}
      />
    </div>
  );
}
