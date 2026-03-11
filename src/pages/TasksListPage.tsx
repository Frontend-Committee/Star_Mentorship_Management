import { TaskDialog } from '@/components/dialogs/TaskDialog';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useCommitteeMembers } from '@/features/members/hooks';
import { useAdminTasks, useCreateTask, useMemberTasks, useAllAdminSubmissions, useAllAdminTasks } from '@/features/tasks/hooks';
import { TaskCreatePayload } from '@/types';
import { CalendarDays, ChevronRight, LayoutList, Loader2, Plus, ChevronLeft, Search, X, ExternalLink, Users, ChevronDown, CheckCircle2, MessageSquare, Target, Activity } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export default function TasksListPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const searchQuery = searchParams.get('q') || '';
  const [searchValue, setSearchValue] = useState(searchQuery);
  const pageSize = 9;

  // Member filter state (admin only)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all committee members for filter (admin only)
  const { data: committeeMembers } = useCommitteeMembers({ enabled: isAdmin });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMemberDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== searchQuery) {
        setSearchParams(prev => {
          if (searchValue) {
            prev.set('q', searchValue);
          } else {
            prev.delete('q');
          }
          prev.set('page', '1');
          return prev;
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue, searchQuery, setSearchParams]);

  // Fetch all tasks in bulk for client-side filtering when a member is selected
  const { data: adminTasksAll, isLoading: isAdminAllLoading } = useAllAdminTasks(
    { search: searchQuery },
    { enabled: isAdmin && selectedMemberId !== null }
  );
  
  const { data: adminTasksPaged, isLoading: isAdminPagedLoading } = useAdminTasks(
    { page, limit: pageSize, search: searchQuery },
    { enabled: isAdmin && selectedMemberId === null }
  );
  
  const { data: memberTasksResponse, isLoading: isMemberTasksLoading } = useMemberTasks(
    { page, limit: pageSize, search: searchQuery }, 
    { enabled: !isAdmin && !!user }
  );

  // Fetch all submissions to build task→user mapping for member filter (admin only)
  const { data: allSubmissions } = useAllAdminSubmissions({ enabled: isAdmin });

  // Build a map: taskId → Set<userId> from submissions
  const taskUserMap = useMemo(() => {
    const map = new Map<number, Set<number>>();
    const submissions = allSubmissions || [];
    for (const sub of submissions) {
      const taskId = typeof sub.task === 'number' ? sub.task : (sub.task as unknown as { id: number }).id;
      const userId = typeof sub.user === 'number' ? sub.user : (sub.user as { id: number }).id;
      if (!map.has(taskId)) map.set(taskId, new Set());
      map.get(taskId)!.add(userId);
    }
    return map;
  }, [allSubmissions]);

  // Pick correct data response or array
  const responseData = isAdmin 
    ? (selectedMemberId !== null ? null : adminTasksPaged) 
    : memberTasksResponse;
    
  const isDataLoading = isAdmin
    ? (selectedMemberId !== null ? isAdminAllLoading : isAdminPagedLoading)
    : isMemberTasksLoading;

  // Filtered members for dropdown search
  const filteredMembers = useMemo(() => {
    if (!committeeMembers) return [];
    if (!memberSearchQuery.trim()) return committeeMembers;
    const q = memberSearchQuery.toLowerCase();
    return committeeMembers.filter(m => {
      const name = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
      return name.includes(q) || (m.email || '').toLowerCase().includes(q);
    });
  }, [committeeMembers, memberSearchQuery]);

  const selectedMember = useMemo(
    () => committeeMembers?.find(m => m.id === selectedMemberId) || null,
    [committeeMembers, selectedMemberId]
  );

  const tasks = useMemo(() => {
    // If we have a selected member, we use the bulk array 'adminTasksAll'
    if (isAdmin && selectedMemberId !== null && adminTasksAll) {
      const filtered = adminTasksAll.filter(t => taskUserMap.get(t.id)?.has(selectedMemberId));
      const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const start = (page - 1) * pageSize;
      return sorted.slice(start, start + pageSize);
    }

    // Otherwise use paginated response (or member response)
    const rawTasks = responseData?.results || [];
    return [...rawTasks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [responseData?.results, adminTasksAll, isAdmin, selectedMemberId, taskUserMap, page, pageSize]);

  const totalFilteredCount = useMemo(() => {
    if (isAdmin && selectedMemberId !== null && adminTasksAll) {
      return adminTasksAll.filter(t => taskUserMap.get(t.id)?.has(selectedMemberId)).length;
    }
    return responseData?.count ?? responseData?.results?.length ?? 0;
  }, [isAdmin, selectedMemberId, adminTasksAll, taskUserMap, responseData]);

  const isLoading = isDataLoading && !responseData;
  const totalPages = Math.ceil(totalFilteredCount / pageSize);


  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const { mutate: createTask, isPending: isCreating } = useCreateTask();

  const handleCreateTask = (taskData: TaskCreatePayload) => {
    createTask(taskData, {
      onSuccess: () => {
        toast.success("Task created successfully");
        setIsTaskDialogOpen(false);
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: Record<string, unknown> } };
        const errorMessage = axiosError.response?.data 
          ? Object.entries(axiosError.response.data).map(([key, value]) => `${key}: ${value}`).join(', ')
          : "Failed to create task";
        toast.error(errorMessage);
      }
    });
  };

  const hasActiveFilters = selectedMemberId !== null || searchQuery;

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Tasks</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isAdmin 
              ? "Manage committee tasks and assignments." 
              : "View your assigned tasks and submit your work."}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsTaskDialogOpen(true)} className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" />
            Create Task
          </Button>
        )}
      </div>


      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative group flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-10 py-6 text-base rounded-2xl border-2 focus:border-primary/50 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
          />
          {searchValue && (
            <button 
              onClick={() => setSearchValue('')}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Member filter dropdown (admin only) */}
        {isAdmin && (
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setMemberDropdownOpen(prev => !prev)}
              className={`flex items-center gap-2 h-full px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all shadow-sm hover:shadow-md bg-background/50 backdrop-blur-sm ${
                selectedMemberId ? 'border-primary text-primary' : 'border-input text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="max-w-[140px] truncate">
                {selectedMember 
                  ? `${selectedMember.first_name || ''} ${selectedMember.last_name || ''}`.trim() || selectedMember.email 
                  : 'Filter by member'}
              </span>
              {selectedMemberId ? (
                <X 
                  className="w-4 h-4 shrink-0 ml-1 hover:text-primary/60"
                  onClick={(e) => { e.stopPropagation(); setSelectedMemberId(null); setMemberSearchQuery(''); }}
                />
              ) : (
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${memberDropdownOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            {memberDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border bg-popover shadow-xl z-50 overflow-hidden">
                {/* Search within dropdown */}
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      autoFocus
                      value={memberSearchQuery}
                      onChange={e => setMemberSearchQuery(e.target.value)}
                      placeholder="Search members..."
                      className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 rounded-xl border-0 outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                  {/* All option */}
                  <button
                    onClick={() => { setSelectedMemberId(null); setMemberDropdownOpen(false); setMemberSearchQuery(''); setSearchParams(prev => { prev.set('page', '1'); return prev; }); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors ${selectedMemberId === null ? 'text-primary font-semibold' : ''}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 text-primary" />
                    </div>
                    All Members
                  </button>

                  {filteredMembers.length === 0 && (
                    <p className="px-3 py-4 text-sm text-muted-foreground text-center">No members found</p>
                  )}

                  {filteredMembers.map(member => {
                    const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email || `#${member.id}`;
                    const initials = `${(member.first_name || '')[0] || ''}${(member.last_name || '')[0] || ''}`.toUpperCase() || '?';
                    return (
                      <button
                        key={member.id}
                        onClick={() => { setSelectedMemberId(member.id ?? null); setMemberDropdownOpen(false); setMemberSearchQuery(''); setSearchParams(prev => { prev.set('page', '1'); return prev; }); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors ${selectedMemberId === member.id ? 'text-primary font-semibold bg-primary/5' : ''}`}
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <span className="truncate">{fullName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active filter chips */}
      {isAdmin && selectedMember && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filtered by:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <Users className="w-3 h-3" />
            {`${selectedMember.first_name || ''} ${selectedMember.last_name || ''}`.trim() || selectedMember.email}
            <button onClick={() => { setSelectedMemberId(null); setSearchParams(prev => { prev.set('page', '1'); return prev; }); }} className="ml-1 hover:text-primary/60 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
          <span className="text-xs text-muted-foreground">
            — {totalFilteredCount} task{totalFilteredCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
            <div className="p-4 rounded-full bg-muted mb-4">
              <LayoutList className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold">
              {hasActiveFilters ? "No results found" : "No Tasks Found"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
              {searchQuery 
                ? `We couldn't find any tasks matching "${searchQuery}".`
                : selectedMemberId
                  ? `No tasks assigned to ${selectedMember ? `${selectedMember.first_name || ''} ${selectedMember.last_name || ''}`.trim() : 'this member'}.`
                  : (isAdmin 
                      ? "Create a new task to get started." 
                      : "No tasks have been assigned yet.")
              }
            </p>
            {isAdmin && !hasActiveFilters && (
              <Button onClick={() => setIsTaskDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create First Task
              </Button>
            )}
            {hasActiveFilters && (
              <Button variant="outline" onClick={() => { setSearchValue(''); setSelectedMemberId(null); }} className="gap-2">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tasks.map((task, index) => (
              <Card key={task.id} className="relative h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary rounded-2xl animate-scale-in flex flex-col" style={{ animationDelay: `${index * 0.05}s` }}>
                <Link to={`/tasks/${task.id}`} className="absolute inset-0 z-0" aria-label={`View task ${task.title}`} />
                <CardHeader className="pb-3 relative z-10 pointer-events-none">
                  <div className="flex justify-between items-start gap-4 w-full">
                    <CardTitle className="text-xl font-bold line-clamp-2 transition-colors flex-1 min-w-0 pr-2">
                      {task.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 pointer-events-auto shrink-0 mt-0.5">
                      {task.links && task.links.length > 0 && (
                        <a 
                          href={task.links[0].url.startsWith('http') ? task.links[0].url : `https://${task.links[0].url}`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          title="View Resource"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <ChevronRight className="w-5 h-5 text-muted-foreground transition-colors opacity-0 group-hover:opacity-100 pointer-events-none" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col relative z-10 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      <span>Due: {new Date(task.date).toLocaleDateString()}</span>
                    </div>
                    {new Date(task.date) < new Date() && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        Expired
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground line-clamp-3 text-sm break-words flex-1">
                    <MarkdownRenderer content={task.description} />
                  </div>
                  {/* Assigned count pill */}
                  {isAdmin && task.assigned_to && task.assigned_to.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pointer-events-none">
                      <Users className="w-3.5 h-3.5" />
                      <span>{task.assigned_to.length} assigned</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="w-10 h-10 rounded-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (
                    p === 1 || 
                    p === totalPages || 
                    (p >= page - 1 && p <= page + 1)
                  ) {
                    return (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        onClick={() => handlePageChange(p)}
                        className={`w-10 h-10 rounded-xl transition-all ${page === p ? 'shadow-lg shadow-primary/20' : ''}`}
                      >
                        {p}
                      </Button>
                    );
                  }
                  
                  if (p === 2 || p === totalPages - 1) {
                    return <span key={p} className="px-1 text-muted-foreground">...</span>;
                  }
                  
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="w-10 h-10 rounded-xl"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </>
      )}

      {isAdmin && (
        <TaskDialog 
          open={isTaskDialogOpen} 
          onOpenChange={setIsTaskDialogOpen}
          onSubmit={handleCreateTask}
          isLoading={isCreating}
        />
      )}
    </div>
  );
}
