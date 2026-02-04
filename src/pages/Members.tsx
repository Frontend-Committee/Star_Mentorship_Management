import { AddMemberDialog } from '@/components/dialogs/AddMemberDialog';
import { MemberProfileDialog } from '@/components/dialogs/MemberProfileDialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useMembersWithProgress, useDeleteMember, useCommitteeMembers } from '@/features/members/hooks';
import { toast } from '@/hooks/use-toast';
import { Member, MemberMinimal } from '@/types';
import { CalendarCheck, Crown, Eye, Loader2, Mail, Search, TrendingUp, Shield, Users as UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Members() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use real data from API for mentees
  const { data: response, isLoading, error } = useMembersWithProgress({ search: debouncedSearchQuery });
  
  // Use committee-specific endpoint for committee list
  const { data: committeeData, isLoading: isLoadingCommittee } = useCommitteeMembers();

  const deleteMemberMutation = useDeleteMember();

  // Transform API users to Member type
  const members: Member[] = useMemo(() => {
    const apiUsers = response?.results || [];
    return apiUsers.map(u => {
      // Prioritize numeric ID from API
      const actualId = u.id || u.user_id;
      return {
        id: actualId ? actualId.toString() : Math.random().toString(),
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'Anonymous Member',
        email: u.email || 'No email provided',
        progress: u.week_progress || 0,
        attendance: u.session_attendance || 0,
        isBest: false,
        tasksSubmitted: 0,
        level: u.level || '1',
      };
    });
  }, [response]);

  // Transform Committee data
  const committeeMembers: Member[] = useMemo(() => {
    const apiUsers = committeeData || [];
    return apiUsers.map((u: MemberMinimal) => {
      const actualId = u.id;
      return {
        id: actualId ? actualId.toString() : Math.random().toString(),
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'Anonymous Member',
        email: u.email || 'No email provided',
        progress: 0, // Committee doesn't have student progress
        attendance: 0,
        isBest: false,
        tasksSubmitted: 0,
      };
    });
  }, [committeeData]);
  
  const handleToggleBestMember = (id: string) => {
    // This functionality requires an API endpoint to update "isBest" status
    // For now, we'll just show a toast that it's not implemented yet
    toast({
      title: "Not Implemented",
      description: "Best member toggling requires backend support.",
      variant: "destructive"
    });
  };

  const handleViewProfile = (member: Member) => {
    setSelectedMember(member);
    setIsProfileOpen(true);
  };

  const handleSaveNotes = (memberId: string, notes: string) => {
    // Requires API endpoint to save notes
    toast({
      title: "Not Implemented",
      description: "Saving notes requires backend support.",
      variant: "destructive"
    });
  };

  const handleDeleteMember = (memberId: string) => {
    // Prevent self-deletion
    if (user && memberId === user.id.toString()) {
      toast({
        title: "Action Restricted",
        description: "You cannot delete your own account.",
        variant: "destructive"
      });
      return;
    }

    deleteMemberMutation.mutate(memberId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Member deleted successfully.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete member.",
          variant: "destructive"
        });
      }
    });
  };

  const filteredMentees = useMemo(() => {
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const filteredCommittee = useMemo(() => {
    return committeeMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [committeeMembers, searchQuery]);

  const bestMember = members.find((m) => m.isBest);

  if (isLoading && !debouncedSearchQuery) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const isSearching = isLoading && !!debouncedSearchQuery;

  if (error) {
    return (
      <div className="text-center text-red-500">
        Failed to load members. Please try again later.
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Members</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage committee members and participants
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          {isAdmin && <AddMemberDialog onSuccess={() => { }} />}
        </div>
      </div>

      <Tabs defaultValue="mentees" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
          <TabsTrigger value="mentees" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="committee" className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4" />
            Committee
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mentees" className="space-y-6">
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

          {/* Members Grid - Participants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {members.length === 0 ? (
              <EmptyState type="participants" />
            ) : filteredMentees.length > 0 ? (
              filteredMentees.map((member, index) => (
                <MemberCard key={member.id} member={member} index={index} onAction={() => handleViewProfile(member)} showProgress isAdmin={isAdmin} />
              ))
            ) : (
              <EmptyState query={searchQuery} onClear={() => setSearchQuery('')} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="committee" className="space-y-6">
          {/* Members Grid - Committee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoadingCommittee ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="h-48 animate-pulse bg-muted" />
              ))
            ) : committeeMembers.length === 0 ? (
              <EmptyState type="committee" />
            ) : filteredCommittee.length > 0 ? (
              filteredCommittee.map((member, index) => (
                <MemberCard key={member.id} member={member} index={index} onAction={() => handleViewProfile(member)} isAdmin={isAdmin} />
              ))
            ) : (
              <EmptyState query={searchQuery} onClear={() => setSearchQuery('')} />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedMember && (
        <MemberProfileDialog
          member={selectedMember}
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          onSaveNotes={handleSaveNotes}
          onToggleBestMember={handleToggleBestMember}
          onDeleteMember={handleDeleteMember}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

// --- Sub-components to keep Members readable ---

function MemberCard({ member, index, onAction, showProgress = false, isAdmin }: { 
  member: Member; 
  index: number; 
  onAction: () => void;
  showProgress?: boolean;
  isAdmin: boolean;
}) {
  return (
    <Card
      key={member.id}
      className="group hover:shadow-lg transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between">
          <Avatar className="w-12 h-12 border-2 border-background shadow-sm group-hover:scale-105 transition-transform duration-300">
            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary font-bold">
              {member.name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            {member.isBest && (
              <div className="p-1.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" title="Best Member">
                <Crown className="w-4 h-4" />
              </div>
            )}
            {member.level && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  member.level === '3' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200/50" : 
                  member.level === '2' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/50" :
                  "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200/50"
                )}
              >
                <Shield className="w-3 h-3 mr-1" />
                Level {member.level}
              </Badge>
            )}
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={onAction}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg leading-none mb-1 group-hover:text-primary transition-colors">
            {member.name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3 h-3" />
            <span className="truncate">{member.email}</span>
          </p>
        </div>

        {showProgress && (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{member.progress}%</span>
              </div>
              <Progress value={member.progress} className="h-1.5" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-secondary/50">
                <CalendarCheck className="w-3.5 h-3.5 text-primary" />
                <span>{member.attendance}% Att.</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-secondary/50">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                <span>{member.tasksSubmitted} Tasks</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ query, onClear, type = 'search' }: { query?: string; onClear?: () => void; type?: 'search' | 'participants' | 'committee' }) {
  const isSearch = type === 'search';
  
  const icon = isSearch ? (
    <Search className="w-8 h-8 text-muted-foreground" />
  ) : (
    <UsersIcon className="w-8 h-8 text-muted-foreground" />
  );

  const title = isSearch ? "No members found" : type === 'participants' ? "No Participants Yet" : "No Committee Members";
  
  const description = isSearch 
    ? `We couldn't find any members matching "${query}". Try a different name or email.`
    : type === 'participants' 
      ? "There are currently no participants registered in the system."
      : "No committee members have been assigned yet.";

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div className="p-4 rounded-full bg-muted mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mt-2">
        {description}
      </p>
      {isSearch && query && (
        <Button 
          variant="link" 
          onClick={onClear}
          className="mt-2 text-primary"
        >
          Clear search
        </Button>
      )}
    </div>
  );
}
