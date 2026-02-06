import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { AddProjectDialog } from '@/components/dialogs/AddProjectDialog';
import { ProjectDetailsDialog } from '@/components/dialogs/ProjectDetailsDialog';
import { Project, Task } from '@/types';
import { FolderKanban, Star, Clock, CheckCircle, AlertCircle, Plus, MessageSquare } from 'lucide-react';
import { useAdminTasks, useCreateTask, useMemberTasks } from '@/features/tasks/hooks';
import { useSubmissions } from '@/features/submissions/hooks';
import { SubmissionSkeleton } from '@/components/submissions/SubmissionSkeleton';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  submitted: { label: 'Submitted', icon: AlertCircle, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  reviewed: { label: 'Reviewed', icon: CheckCircle, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const { data: adminTasksResponse, isLoading: isLoadingAdmin } = useAdminTasks(undefined, { enabled: isAdmin });
  const { data: memberTasksResponse, isLoading: isLoadingMember } = useMemberTasks(undefined, { enabled: !isAdmin });
  const { data: submissionsResponse, isLoading: isLoadingSubs } = useSubmissions(undefined, { enabled: !isAdmin });
  
  const createTask = useCreateTask();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Project | null>(null);

  const isLoading = isAdmin ? isLoadingAdmin : (isLoadingMember || isLoadingSubs);

  const projects = useMemo<Project[]>(() => {
    const adminTasks = adminTasksResponse?.results || [];
    const memberTasks = memberTasksResponse?.results || [];
    const submissions = submissionsResponse?.results || [];
    const baseTasks = isAdmin ? adminTasks : memberTasks;
    
    return baseTasks.map(task => {
      const submission = submissions.find(s => (typeof s.task === 'number' ? s.task : s.task.id) === task.id);
      
      let status: 'pending' | 'submitted' | 'reviewed' = 'pending';
      if (submission) {
        status = submission.feedback ? 'reviewed' : 'submitted';
      }

      return {
        id: task.id.toString(),
        title: task.title,
        description: task.description,
        status,
        submittedAt: submission?.submitted_at,
        feedback: submission?.feedback?.note,
      };
    });
  }, [isAdmin, adminTasksResponse?.results, memberTasksResponse?.results, submissionsResponse?.results]);

  const handleAddProject = async (newProject: { title: string; description: string }) => {
    try {
      await createTask.mutateAsync({
        title: newProject.title,
        description: newProject.description,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return <SubmissionSkeleton />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            {isAdmin ? 'Project Management' : 'My Projects'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isAdmin
              ? 'Review submissions and provide feedback'
              : 'Track your project submissions and feedback'}
          </p>
        </div>
        {isAdmin && (
          <Button variant="gradient" onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, index) => {
          const status = statusConfig[project.status];
          const StatusIcon = status.icon;

          return (
            <Card
              key={project.id}
              className="border-border/50 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <FolderKanban className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <Badge className={`${status.color} text-xs`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">{status.label}</span>
                  </Badge>
                </div>
                <CardTitle className="text-base sm:text-lg font-heading mt-3 break-words">{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{project.description}</p>

                {project.submittedAt && (
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(project.submittedAt).toLocaleDateString()}
                  </p>
                )}

                {project.feedback && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">Feedback</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{project.feedback}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  {project.status === 'pending' && !isAdmin && (
                    <Button variant="gradient" size="sm" className="flex-1">
                      Submit
                    </Button>
                  )}
                  {isAdmin && project.status === 'submitted' && (
                    <Button variant="default" size="sm" className="flex-1">
                      Review
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => setSelectedTask(project)}>
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {projects.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No projects found.
          </div>
        )}
      </div>

      <AddProjectDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddProject={handleAddProject}
      />

      <ProjectDetailsDialog
        project={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </div>
  );
}
