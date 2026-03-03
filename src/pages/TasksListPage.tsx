import { TaskDialog } from '@/components/dialogs/TaskDialog';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useAdminTasks, useCreateTask, useMemberTasks } from '@/features/tasks/hooks';
import { Task, TaskCreatePayload } from '@/types';
import { CalendarDays, ChevronRight, LayoutList, Loader2, Plus, ChevronLeft, Search, X } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
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

  // Fetch tasks based on role
  const { data: adminTasksResponse, isLoading: isAdminLoading, isPlaceholderData: isAdminPlaceholder } = useAdminTasks(
    { page, limit: pageSize, search: searchQuery }, 
    { enabled: isAdmin }
  );
  const { data: memberTasksResponse, isLoading: isMemberTasksLoading, isPlaceholderData: isMemberPlaceholder } = useMemberTasks(
    { page, limit: pageSize, search: searchQuery }, 
    { enabled: !isAdmin && !!user }
  );
  
  const responseData = isAdmin ? adminTasksResponse : memberTasksResponse;
  const isDataLoading = isAdmin ? isAdminLoading : isMemberTasksLoading;
  const isPlaceholder = isAdmin ? isAdminPlaceholder : isMemberPlaceholder;
  
  const tasks = useMemo(() => {
    const rawTasks = responseData?.results || [];
    const sortedTasks = [...rawTasks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // If the server returns more than pageSize results, assume it didn't paginate
    // or its page size is larger than ours, so we must slice on the client.
    if (sortedTasks.length > pageSize) {
      const start = (page - 1) * pageSize;
      return sortedTasks.slice(start, start + pageSize);
    }
    
    // Otherwise, assume the server already gave us the correct page
    return sortedTasks;
  }, [responseData?.results, page, pageSize]);
  
  const isLoading = isDataLoading && !responseData;
  const totalCount = responseData?.count ?? responseData?.results?.length ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
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
      
      <div className="relative group max-w-2xl mx-auto w-full">
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
              {searchQuery ? "No results found" : "No Tasks Found"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
              {searchQuery 
                ? `We couldn't find any tasks matching "${searchQuery}".`
                : (isAdmin 
                    ? "Create a new task to get started." 
                    : "No tasks have been assigned yet.")
              }
            </p>
            {isAdmin && !searchQuery && (
              <Button onClick={() => setIsTaskDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create First Task
              </Button>
            )}
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchValue('')} className="gap-2">
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tasks.map((task, index) => (
              <Link key={task.id} to={`/tasks/${task.id}`} className="block h-full group animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <Card className="h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-l-4 border-l-primary/50 group-hover:border-l-primary rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                        {task.title}
                      </CardTitle>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                    <div className="text-muted-foreground line-clamp-3 text-sm break-words">
                      <MarkdownRenderer content={task.description} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
                  // Only show current, first, last, and pages around current
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
