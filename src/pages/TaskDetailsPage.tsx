import { TaskDialog } from '@/components/dialogs/TaskDialog';
import { FeedbackDialog } from '@/components/dialogs/FeedbackDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import {
  useCreateSubmission,
  useSubmissions as useMemberSubmissions,
  useUpdateSubmission
} from '@/features/submissions/hooks';
import {
  useAdminTask,
  useAdminTaskSubmissions,
  useCreateFeedback,
  useMemberTask,
  useUpdateFeedback,
  usePartialUpdateTask,
  useDeleteTask,
} from '@/features/tasks/hooks';
import { FeedbackCreatePayload, Submission, TaskCreatePayload } from '@/types';
import { CalendarDays, CheckCircle2, Clock, Edit, ExternalLink, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { DeleteConfirmationDialog } from '@/components/dialogs/DeleteConfirmationDialog';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const taskId = Number(id);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Data Fetching
  const { data: adminTask, isLoading: isAdminTaskLoading } = useAdminTask(taskId, { enabled: isAdmin });
  const { data: memberTask, isLoading: isMemberTaskLoading } = useMemberTask(taskId, { enabled: !isAdmin });
  const task = isAdmin ? adminTask : memberTask;
  const isTaskLoading = isAdmin ? isAdminTaskLoading : isMemberTaskLoading;

  // Submissions Data
  const { data: adminSubmissions, isLoading: isAdminSubsLoading } = useAdminTaskSubmissions(taskId, { enabled: isAdmin });
  const { data: memberSubmissions, isLoading: isMemberSubsLoading } = useMemberSubmissions({ enabled: !isAdmin });

  // For member, find their specific submission for this task
  const mySubmission = !isAdmin && memberSubmissions
    ? memberSubmissions.find(s => (typeof s.task === 'number' ? s.task : s.task.id) === taskId)
    : null;

  // Actions
  const { mutate: createSubmission, isPending: isSubmitting } = useCreateSubmission();
  const { mutate: updateSubmission, isPending: isUpdatingSub } = useUpdateSubmission();
  const { mutate: createFeedback, isPending: isCreatingFeedback } = useCreateFeedback();
  const { mutate: updateFeedback, isPending: isUpdatingFeedback } = useUpdateFeedback();
  const { mutate: partialUpdateTask, isPending: isUpdatingTask } = usePartialUpdateTask();
  const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();
  const navigate = useNavigate();

  // State
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (mySubmission) {
      setSubmissionUrl(mySubmission.task_url);
      setSubmissionNote(mySubmission.note || '');
    }
  }, [mySubmission]);

  // Handlers
  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      task: taskId,
      task_url: submissionUrl,
      note: submissionNote,
      status: 'SUBMITTED' as const
    };

    if (mySubmission) {
      updateSubmission({ id: mySubmission.id, data: payload }, {
        onSuccess: () => toast.success("Submission updated successfully"),
        onError: () => toast.error("Failed to update submission")
      });
    } else {
      createSubmission(payload, {
        onSuccess: () => toast.success("Work submitted successfully"),
        onError: () => toast.error("Failed to submit work")
      });
    }
  };

  const handleFeedbackSubmit = (data: FeedbackCreatePayload) => {
    if (selectedSubmission?.feedback) {
      updateFeedback({ id: selectedSubmission.feedback.id, data }, {
        onSuccess: () => {
          toast.success("Feedback updated");
          setIsFeedbackDialogOpen(false);
          setSelectedSubmission(null);
        },
        onError: () => toast.error("Failed to update feedback")
      });
    } else {
      createFeedback(data, {
        onSuccess: () => {
          toast.success("Feedback sent");
          setIsFeedbackDialogOpen(false);
          setSelectedSubmission(null);
        },
        onError: () => toast.error("Failed to send feedback")
      });
    }
  };

  const openFeedbackDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsFeedbackDialogOpen(true);
  };
   
  const handleUpdateTask = (data: TaskCreatePayload) => {
    // We treat edits from dialog as PATCH updates for now, or we could check if fields are missing.
    // Given the dialog sends full data, we can use partialUpdateTask as well since it accepts TaskUpdatePayload.
    // However, data from dialog is TaskCreatePayload (all fields required by UI but payload wise similar).
    
    partialUpdateTask({ id: taskId, data }, {
      onSuccess: () => {
        toast.success("Task updated successfully");
        setIsTaskDialogOpen(false);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data
          ? Object.entries(error.response.data).map(([key, value]) => `${key}: ${value}`).join(', ')
          : "Failed to update task";
        toast.error(errorMessage);
      }
    });
  };

  if (isTaskLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-xl font-bold text-destructive">Task not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 lg:space-y-8 animate-fade-in">
      {/* Task Details Header */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground leading-tight">{task.title}</h1>
            <div className="flex items-center gap-3 text-muted-foreground mt-2 text-sm sm:text-base">
              <span className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary/80">Due: {new Date(task.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </span>
            </div>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button onClick={() => setIsTaskDialogOpen(true)} variant="outline" className="flex-1 sm:flex-initial gap-2 h-10 border-primary/20 hover:bg-primary/5 transition-all">
                <Edit className="w-4 h-4" />
                Edit Task
              </Button>
              <Button onClick={() => setIsDeleteDialogOpen(true)} variant="destructive" size="icon" className="h-10 w-10 shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        
        <Card className="glass overflow-hidden border-border/50">
          <div className="bg-primary/5 px-6 py-3 border-b border-border/40">
             <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70">Task Description</h3>
          </div>
          <CardContent className="p-6">
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-sm sm:text-base">
              {task.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin View: Submissions List */}
      {isAdmin && (
        <Card className="glass border-border/50">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Submissions
            </CardTitle>
            <CardDescription className="text-sm">
              Review and grade member submissions for this task.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isAdminSubsLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
              </div>
            ) : !adminSubmissions?.length ? (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-muted/50">
                   <Clock className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium">No submissions yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Member</TableHead>
                      <TableHead className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                      <TableHead className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Submitted At</TableHead>
                      <TableHead className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Score</TableHead>
                      <TableHead className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminSubmissions.map((sub) => {
                      const user = typeof sub.user === 'object' && sub.user !== null
                        ? sub.user
                        : { id: sub.user, first_name: 'Member', last_name: `#${sub.user}`, email: '' };

                      return (
                        <TableRow key={sub.id} className="hover:bg-primary/5 transition-colors border-border/40">
                          <TableCell className="px-6 py-4 font-semibold text-foreground">
                            {user.first_name} {user.last_name}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <Badge className={`uppercase text-[10px] tracking-widest font-bold ${
                              sub.status === 'SUBMITTED' ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15' : 'bg-muted text-muted-foreground'
                            }`} variant="outline">
                              {sub.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                            {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {sub.feedback ? (
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${sub.feedback.score >= 50 ? "bg-green-500" : "bg-red-500"}`} />
                                <span className={`font-bold ${sub.feedback.score >= 50 ? "text-green-600" : "text-red-600"}`}>
                                  {sub.feedback.score}/100
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/40 text-[11px] italic font-medium">Pending Grade</span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {sub.task_url && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-background/40 border border-border/40 hover:bg-primary/10 hover:text-primary transition-all" asChild>
                                  <a href={sub.task_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="gradient"
                                size="sm"
                                className="h-8 px-3 text-[11px] font-bold uppercase tracking-wider shadow-sm"
                                onClick={() => openFeedbackDialog(sub)}
                              >
                                {sub.feedback ? 'Edit Grade' : 'Add Grade'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Member View: Submission Area */}
      {!isAdmin && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Submission Form/Status */}
          <Card className="h-fit glass border-border/50">
            <CardHeader className="border-b border-border/40 bg-primary/5">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Edit className="w-5 h-5 text-primary" />
                Your Submission
              </CardTitle>
              <CardDescription>
                Submit your project URL and any notes for the mentors.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {mySubmission?.status === 'SUBMITTED' ? (
                <div className="space-y-6">
                  <div className="bg-green-500/10 dark:bg-green-950/30 p-5 rounded-2xl flex items-start gap-4 border border-green-500/20 shadow-sm">
                    <div className="p-2 bg-green-500/10 rounded-full">
                       <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-700 dark:text-green-400">Success!</h4>
                      <p className="text-sm text-green-600/80 dark:text-green-300/70 mt-1 leading-relaxed">
                        Task submitted on {mySubmission.submitted_at ? new Date(mySubmission.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}. Mentors will review it shortly.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Project URL</Label>
                    <a
                      href={mySubmission.task_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border/40 text-primary hover:bg-primary/5 hover:border-primary/20 transition-all group overflow-hidden"
                    >
                      <ExternalLink className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="truncate font-medium flex-1">{mySubmission.task_url}</span>
                    </a>
                  </div>
                  {mySubmission.note && (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Submission Note</Label>
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/20 text-sm leading-relaxed text-foreground/80 italic">
                        "{mySubmission.note}"
                      </div>
                    </div>
                  )}
                  
                  {/* Edit Form Toggle (Simplified as a section below) */}
                  <div className="pt-6 border-t border-border/40">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Need to update your work?</h4>
                    <form onSubmit={handleMemberSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-url" className="text-xs font-semibold">Updated Project URL</Label>
                        <Input
                          id="edit-url"
                          value={submissionUrl}
                          onChange={(e) => setSubmissionUrl(e.target.value)}
                          className="bg-background/50"
                          placeholder="https://..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-note" className="text-xs font-semibold">Updated Note</Label>
                        <Textarea
                          id="edit-note"
                          value={submissionNote}
                          onChange={(e) => setSubmissionNote(e.target.value)}
                          className="bg-background/50 resize-none"
                          rows={3}
                        />
                      </div>
                      <Button type="submit" variant="outline" className="w-full h-11 font-bold border-primary/20 hover:bg-primary/5 text-primary" disabled={isSubmitting || isUpdatingSub}>
                        {isSubmitting || isUpdatingSub ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Edit className="w-4 h-4 mr-2" />}
                        Update Submission
                      </Button>
                    </form>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleMemberSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-sm font-semibold">Project URL</Label>
                    <Input
                      id="url"
                      placeholder="https://github.com/your-username/repo"
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      className="h-11 bg-background/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note" className="text-sm font-semibold">Mentorship Notes (Optional)</Label>
                    <Textarea
                      id="note"
                      placeholder="Share any challenges you faced or context for the mentor..."
                      value={submissionNote}
                      onChange={(e) => setSubmissionNote(e.target.value)}
                      rows={4}
                      className="bg-background/50 resize-none"
                    />
                  </div>
                  <Button type="submit" variant="gradient" className="w-full h-12 text-base font-bold shadow-lg" disabled={isSubmitting || isUpdatingSub}>
                    {(isSubmitting || isUpdatingSub) ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                    )}
                    Submit Final Work
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Feedback Card */}
          <Card className="h-fit glass border-border/50 overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-secondary/10">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Mentor Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {mySubmission?.feedback ? (
                <div className="space-y-8">
                  <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 shadow-inner">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-2">Performance Score</span>
                    <span className={`text-6xl font-heading font-black tabular-nums ${mySubmission.feedback.score >= 50 ? 'text-primary' : 'text-destructive text-opacity-80'}`}>
                      {mySubmission.feedback.score}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground mt-1">/ 100 points</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/70">
                       <MessageSquare className="w-4 h-4" />
                       Mentor's Review
                    </div>
                    <div className="relative p-6 rounded-2xl bg-muted/20 border border-border/30 text-sm leading-relaxed text-foreground/90 italic shadow-sm">
                      <div className="absolute top-0 left-6 -translate-y-1/2 bg-background px-2">
                         <span className="text-2xl text-primary/20 font-serif">"</span>
                      </div>
                      {mySubmission.feedback.note}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center relative">
                     <Clock className="w-10 h-10 text-muted-foreground/30" />
                     <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-spin-slow" />
                  </div>
                  <div className="space-y-1 max-w-[240px]">
                    <h4 className="font-bold text-foreground">Awaiting Review</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {mySubmission?.status === 'SUBMITTED'
                        ? "Your mentor hasn't graded your submission yet. Check back soon!"
                        : "Grade and feedback will appear here once you submit your work."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Task Edit Dialog */}
      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        onSubmit={handleUpdateTask}
        task={task}
        isLoading={isUpdatingTask}
      />

      {/* Admin Feedback Dialog */}
      <FeedbackDialog
        open={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
        onSubmit={handleFeedbackSubmit}
        submission={selectedSubmission}
        isLoading={isCreatingFeedback || isUpdatingFeedback}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
            deleteTask(taskId, {
                onSuccess: () => {
                    toast.success("Task deleted successfully");
                    navigate('/tasks');
                },
                onError: () => toast.error("Failed to delete task")
            });
        }}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone and will delete all member submissions associated with it."
        isLoading={isDeletingTask}
      />
    </div>
  );
}
