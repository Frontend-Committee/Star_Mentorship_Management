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
  useDeleteFeedback,
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
  const { data: adminSubmissionsResponse, isLoading: isAdminSubsLoading } = useAdminTaskSubmissions(taskId, { enabled: isAdmin });
  const adminSubmissions = adminSubmissionsResponse || []; // useAdminTaskSubmissions already returns results array
  
  const { data: memberSubmissionsResponse, isLoading: isMemberSubsLoading } = useMemberSubmissions(undefined, { enabled: !isAdmin });
  const memberSubmissions = memberSubmissionsResponse?.results || [];

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
  const { mutate: deleteFeedback, isPending: isDeletingFeedback } = useDeleteFeedback();
  const navigate = useNavigate();

  // State
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFeedbackDeleteDialogOpen, setIsFeedbackDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (mySubmission) {
      setSubmissionUrl(mySubmission.task_url || '');
      setSubmissionNote(mySubmission.note || '');
    }
  }, [mySubmission]);

  // Handlers
  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mySubmission) {
      // Update payload for PUT should NOT include the task ID according to docs
      const updatePayload = {
        task_url: submissionUrl,
        note: submissionNote.trim() || "Work submission",
        status: 'sub' as const
      };

      updateSubmission({ id: mySubmission.id, data: updatePayload, usePut: true }, {
        onSuccess: () => {
          toast.success("Submission updated successfully");
          setIsEditing(false);
        },
        onError: (error: unknown) => {
          const axiosError = error as { response?: { data?: Record<string, unknown> } };
          const errorData = axiosError.response?.data;
          const errorMessage = errorData
            ? Object.entries(errorData).map(([key, value]) => `${key}: ${value}`).join(', ')
            : "Failed to update submission";
          toast.error(errorMessage);
        }
      });
    } else {
      // Create payload MUST include the task ID
      const createPayload = {
        task: taskId,
        task_url: submissionUrl,
        note: submissionNote.trim() || "Work submission",
        status: 'sub' as const
      };
      
      createSubmission(createPayload, {
        onSuccess: () => {
          toast.success("Work submitted successfully");
        },
        onError: (error: unknown) => {
          const axiosError = error as { response?: { data?: Record<string, unknown> } };
          const errorData = axiosError.response?.data;
          const errorMessage = errorData
            ? Object.entries(errorData).map(([key, value]) => `${key}: ${value}`).join(', ')
            : "Failed to submit work";
          toast.error(errorMessage);
        }
      });
    }
  };

  const handleFeedbackSubmit = (data: FeedbackCreatePayload) => {
    if (selectedSubmission?.feedback) {
      updateFeedback({ id: selectedSubmission.feedback.id, data, usePut: true }, {
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
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: Record<string, unknown> } };
        const errorMessage = axiosError.response?.data
          ? Object.entries(axiosError.response.data).map(([key, value]) => `${key}: ${value}`).join(', ')
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
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-foreground leading-tight">{task.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground text-xs sm:text-sm">
                <span className="flex items-center gap-1.5 font-medium text-primary">
                  <CalendarDays className="w-4 h-4" />
                  Due {new Date(task.date).toLocaleDateString()}
                </span>
              </div>
            </div>
            {isAdmin && (
              <div className="flex flex-row sm:flex-nowrap gap-2 w-full sm:w-auto">
                <Button onClick={() => setIsTaskDialogOpen(true)} variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 h-9 text-xs">
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button onClick={() => setIsDeleteDialogOpen(true)} variant="destructive" size="sm" className="flex-1 sm:flex-none gap-2 h-9 text-xs">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed break-words overflow-hidden">
              {task.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin View: Submissions List */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>
              View and grade member submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAdminSubsLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !adminSubmissions?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                No submissions yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/50">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[180px] sm:w-auto font-bold uppercase tracking-wider text-[10px] py-4">Member</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider text-[10px] py-4">Status</TableHead>
                      <TableHead className="hidden sm:table-cell font-bold uppercase tracking-wider text-[10px] py-4">Date</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider text-[10px] py-4">Score</TableHead>
                      <TableHead className="font-bold uppercase tracking-wider text-[10px] text-right py-4 pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminSubmissions.map((sub) => {
                      const user = typeof sub.user === 'object' && sub.user !== null
                        ? sub.user
                        : { id: sub.user, first_name: 'Member', last_name: `#${sub.user}`, email: '' };

                      const getStatusConfig = (status: string) => {
                        const s = status?.toLowerCase() || '';
                        if (['submitted', 'sub', 'reviewed'].includes(s)) {
                          return { color: 'bg-green-500/15 text-green-700 border-green-500/20 hover:bg-green-500/25', label: status };
                        }
                        if (['pending', 'pen'].includes(s)) {
                          return { color: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/25', label: status };
                        }
                        if (['missed', 'mis'].includes(s)) {
                          return { color: 'bg-red-500/15 text-red-700 border-red-500/20 hover:bg-red-500/25', label: status };
                        }
                        return { color: 'bg-secondary text-secondary-foreground', label: status };
                      };

                      const statusConfig = getStatusConfig(sub.status);

                      return (
                        <TableRow key={sub.id} className="group transition-colors">
                          <TableCell className="font-medium whitespace-nowrap">
                            {user.first_name} {user.last_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[10px] font-bold border ${statusConfig.color}`}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                            {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {sub.feedback ? (
                              <span className={sub.feedback.score >= 50 ? "text-green-600 font-bold text-xs" : "text-red-600 font-bold text-xs"}>
                                {sub.feedback.score}/100
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end items-center gap-2">
                              {sub.task_url && (
                                <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 text-[10px] font-bold uppercase hover:text-primary hover:bg-primary/5">
                                  <a href={sub.task_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Review Task
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openFeedbackDialog(sub)}
                                disabled={!['SUBMITTED', 'submitted', 'sub', 'reviewed', 'REVIEWED'].includes(sub.status)}
                                className="h-8 px-2 text-[9px] sm:text-[10px] font-bold uppercase bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-primary"
                              >
                                {sub.feedback ? 'Edit Grade' : 'Grade'}
                              </Button>
                              {sub.feedback && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setFeedbackToDelete(sub.feedback!.id);
                                    setIsFeedbackDeleteDialogOpen(true);
                                  }}
                                  disabled={isDeletingFeedback}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 hidden sm:flex"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
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
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Your Submission</CardTitle>
              <CardDescription>
                {mySubmission && ['submitted', 'sub', 'reviewed'].includes(String(mySubmission.status).toLowerCase())
                  ? 'Manage or update your submitted work for this task.' 
                  : 'Submit your work and any relevant notes for this task.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {['submitted', 'sub', 'reviewed'].includes(String(mySubmission?.status || '').toLowerCase()) && !isEditing ? (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg flex items-start gap-3 border border-green-200 dark:border-green-900">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Submitted</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        You have submitted this task on {mySubmission.submitted_at ? new Date(mySubmission.submitted_at).toLocaleDateString() : 'Unknown date'}.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground font-bold">Submission URL</Label>
                    <a
                      href={mySubmission.task_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-primary hover:underline break-all text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mt-0.5 shrink-0" />
                      {mySubmission.task_url}
                    </a>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-2"
                  >
                    Update Submission
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMemberSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-sm font-semibold">Project URL</Label>
                    <Input
                      id="url"
                      placeholder="https://github.com/..."
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      required
                      className="bg-background"
                    />
                    <div className="bg-primary/5 p-2.5 rounded-md border border-primary/10 flex items-start gap-2">
                      <div className="mt-0.5 text-primary">
                      <ExternalLink className="w-3 h-3" />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        <span className="font-bold text-primary mr-1 uppercase text-[9px]">Instructions:</span>
                         Please provide a GitHub repo, Google Drive folder (public access required), or a live project URL.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    {isEditing && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="flex-1 font-bold uppercase text-xs tracking-wider" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      className="flex-[2] font-bold uppercase text-xs tracking-wider" 
                      disabled={isSubmitting || isUpdatingSub}
                    >
                      {(isSubmitting || isUpdatingSub) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {mySubmission && ['submitted', 'sub', 'reviewed'].includes(String(mySubmission.status).toLowerCase()) 
                        ? 'Update Work' 
                        : 'Submit Work'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Show form even if submitted? Maybe inside an accordion or if they click edit.
                  For now, if submitted, I showed a "Update Submission" button but it didn't do anything. 
                  Let's actually make the form visible if they want to edit, or replace the "Submitted" view with the form pre-filled.
                  Actually, let's keep it simple: If submitted, show details. If they want to edit, they can just edit the form fields below (if I render them).
                  
                  Let's change logic: Always show form, but button says "Update" if exists.
                  And show status badge at top.
              */}

            </CardContent>
          </Card>

          {/* Feedback Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Feedback & Grade</CardTitle>
            </CardHeader>
            <CardContent>
              {mySubmission?.feedback ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Score</span>
                    <span className={`text-2xl font-bold ${mySubmission.feedback.score >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {mySubmission.feedback.score}/100
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      Mentor Comments
                    </Label>
                    <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed border">
                      {mySubmission.feedback.note}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-3">
                  <Clock className="w-10 h-10 opacity-20" />
                  <p>No feedback available yet.</p>
                  <p className="text-xs">
                    {['submitted', 'sub', 'reviewed'].includes(String(mySubmission?.status || '').toLowerCase())
                      ? "Your submission is under review."
                      : "Submit your work to receive feedback."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Task Edit Dialog */}
      {isAdmin && (
        <>
          <TaskDialog
            open={isTaskDialogOpen}
            onOpenChange={setIsTaskDialogOpen}
            onSubmit={handleUpdateTask}
            task={task}
            isLoading={isUpdatingTask}
          />

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
          <DeleteConfirmationDialog
            open={isFeedbackDeleteDialogOpen}
            onOpenChange={setIsFeedbackDeleteDialogOpen}
            onConfirm={() => {
              if (feedbackToDelete) {
                deleteFeedback(feedbackToDelete, {
                  onSuccess: () => {
                    toast.success("Feedback deleted");
                    setIsFeedbackDeleteDialogOpen(false);
                    setFeedbackToDelete(null);
                  },
                  onError: () => toast.error("Failed to delete feedback")
                });
              }
            }}
            isLoading={isDeletingFeedback}
            title="Delete Feedback"
            description="Are you sure you want to delete this feedback? The score and note will be permanently removed."
          />
        </>
      )}
    </div>
  );
}
