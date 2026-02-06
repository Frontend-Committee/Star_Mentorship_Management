import { TaskDialog } from '@/components/dialogs/TaskDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useAdminTasks, useCreateTask, useMemberTasks } from '@/features/tasks/hooks';
import { Task, TaskCreatePayload } from '@/types';
import { CalendarDays, ChevronRight, LayoutList, Loader2, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function TasksListPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Fetch tasks based on role
  const { data: adminTasks, isLoading: isAdminLoading } = useAdminTasks(undefined, { enabled: isAdmin });
  const { data: memberTasks, isLoading: isMemberTasksLoading } = useMemberTasks(undefined, { enabled: !isAdmin && !!user });
  
  const tasks = useMemo(() => {
    const rawTasks = (isAdmin ? adminTasks : memberTasks) || [];
    return [...rawTasks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [isAdmin, adminTasks, memberTasks]);
  
  const isLoading = isAdmin ? isAdminLoading : isMemberTasksLoading;

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
            <h3 className="text-lg font-bold">No Tasks Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
              {isAdmin 
                ? "Create a new task to get started." 
                : "No tasks have been assigned yet."}
            </p>
            {isAdmin && (
              <Button onClick={() => setIsTaskDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    <span>Due: {new Date(task.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-3 text-sm break-words">
                    {task.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
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
